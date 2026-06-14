package com.cims.app.service;

import com.cims.app.entity.Idea;
import com.cims.app.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for sending email notifications
 * Handles all email communication for the CIMS application
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${email.from}")
    private String fromEmail;

    @Value("${email.enabled:false}")
    private boolean emailEnabled;

    @Value("${spring.application.name}")
    private String applicationName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    /**
     * Send idea submitted notification
     */
    @Async
    public void sendIdeaSubmittedEmail(Idea idea, User recipient) {
        if (!emailEnabled) {
            log.debug("Email notifications are disabled. Skipping email for idea submission.");
            return;
        }

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("recipientName", recipient.getFirstName());
            variables.put("ideaNumber", idea.getIdeaNumber());
            variables.put("ideaTitle", idea.getTitle());
            variables.put("submitterName", idea.getIdeaOwner().getFirstName() + " " + idea.getIdeaOwner().getLastName());
            variables.put("category", idea.getCategory());
            variables.put("submittedDate", idea.getCreatedAt().format(DATE_FORMATTER));
            variables.put("ideaUrl", getIdeaUrl(idea.getId()));

            String subject = "New Idea Submitted: " + idea.getIdeaNumber();
            String content = buildEmailContent("idea-submitted", variables);

            sendEmail(recipient.getEmail(), subject, content);
            log.info("Idea submitted email sent to: {}", recipient.getEmail());
        } catch (Exception e) {
            log.error("Failed to send idea submitted email to: {}", recipient.getEmail(), e);
        }
    }

    /**
     * Send approval required notification to reviewers
     */
    @Async
    public void sendApprovalRequiredEmail(Idea idea, User reviewer) {
        if (!emailEnabled) {
            log.debug("Email notifications are disabled. Skipping approval required email.");
            return;
        }

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("reviewerName", reviewer.getFirstName());
            variables.put("ideaNumber", idea.getIdeaNumber());
            variables.put("ideaTitle", idea.getTitle());
            variables.put("submitterName", idea.getIdeaOwner().getFirstName() + " " + idea.getIdeaOwner().getLastName());
            variables.put("category", idea.getCategory());
            variables.put("submittedDate", idea.getCreatedAt().format(DATE_FORMATTER));
            variables.put("problemStatement", idea.getProblemStatement());
            variables.put("proposedSolution", idea.getProposedSolution());
            variables.put("expectedBenefits", formatCurrency(idea.getExpectedQuantitativeBenefitsValue()));
            variables.put("ideaUrl", getIdeaUrl(idea.getId()));

            String subject = "Approval Required: " + idea.getIdeaNumber() + " - " + idea.getTitle();
            String content = buildEmailContent("approval-required", variables);

            sendEmail(reviewer.getEmail(), subject, content);
            log.info("Approval required email sent to: {}", reviewer.getEmail());
        } catch (Exception e) {
            log.error("Failed to send approval required email to: {}", reviewer.getEmail(), e);
        }
    }

    /**
     * Send idea approved notification
     */
    @Async
    public void sendIdeaApprovedEmail(Idea idea, String approverName, String comments) {
        if (!emailEnabled) {
            log.debug("Email notifications are disabled. Skipping idea approved email.");
            return;
        }

        try {
            User owner = idea.getIdeaOwner();
            Map<String, Object> variables = new HashMap<>();
            variables.put("ownerName", owner.getFirstName());
            variables.put("ideaNumber", idea.getIdeaNumber());
            variables.put("ideaTitle", idea.getTitle());
            variables.put("approverName", approverName);
            variables.put("approvedDate", idea.getUpdatedAt().format(DATE_FORMATTER));
            variables.put("comments", comments != null ? comments : "No additional comments");
            variables.put("nextSteps", "Your idea is now approved and ready for implementation planning.");
            variables.put("ideaUrl", getIdeaUrl(idea.getId()));

            String subject = "✅ Idea Approved: " + idea.getIdeaNumber();
            String content = buildEmailContent("idea-approved", variables);

            sendEmail(owner.getEmail(), subject, content);
            log.info("Idea approved email sent to: {}", owner.getEmail());
        } catch (Exception e) {
            log.error("Failed to send idea approved email to: {}", idea.getIdeaOwner().getEmail(), e);
        }
    }

    /**
     * Send idea rejected notification
     */
    @Async
    public void sendIdeaRejectedEmail(Idea idea, String reviewerName, String reason) {
        if (!emailEnabled) {
            log.debug("Email notifications are disabled. Skipping idea rejected email.");
            return;
        }

        try {
            User owner = idea.getIdeaOwner();
            Map<String, Object> variables = new HashMap<>();
            variables.put("ownerName", owner.getFirstName());
            variables.put("ideaNumber", idea.getIdeaNumber());
            variables.put("ideaTitle", idea.getTitle());
            variables.put("reviewerName", reviewerName);
            variables.put("rejectedDate", idea.getUpdatedAt().format(DATE_FORMATTER));
            variables.put("reason", reason != null ? reason : "No specific reason provided");
            variables.put("nextSteps", "You can revise and resubmit your idea after addressing the feedback.");
            variables.put("ideaUrl", getIdeaUrl(idea.getId()));

            String subject = "Idea Requires Revision: " + idea.getIdeaNumber();
            String content = buildEmailContent("idea-rejected", variables);

            sendEmail(owner.getEmail(), subject, content);
            log.info("Idea rejected email sent to: {}", owner.getEmail());
        } catch (Exception e) {
            log.error("Failed to send idea rejected email to: {}", idea.getIdeaOwner().getEmail(), e);
        }
    }

    /**
     * Send status changed notification
     */
    @Async
    public void sendStatusChangedEmail(Idea idea, String oldStatus, String newStatus, String changedBy) {
        if (!emailEnabled) {
            log.debug("Email notifications are disabled. Skipping status changed email.");
            return;
        }

        try {
            User owner = idea.getIdeaOwner();
            Map<String, Object> variables = new HashMap<>();
            variables.put("ownerName", owner.getFirstName());
            variables.put("ideaNumber", idea.getIdeaNumber());
            variables.put("ideaTitle", idea.getTitle());
            variables.put("oldStatus", formatStatus(oldStatus));
            variables.put("newStatus", formatStatus(newStatus));
            variables.put("changedBy", changedBy);
            variables.put("changedDate", idea.getUpdatedAt().format(DATE_TIME_FORMATTER));
            variables.put("ideaUrl", getIdeaUrl(idea.getId()));

            String subject = "Status Update: " + idea.getIdeaNumber() + " - " + formatStatus(newStatus);
            String content = buildEmailContent("status-changed", variables);

            sendEmail(owner.getEmail(), subject, content);
            log.info("Status changed email sent to: {}", owner.getEmail());
        } catch (Exception e) {
            log.error("Failed to send status changed email to: {}", idea.getIdeaOwner().getEmail(), e);
        }
    }

    /**
     * Send comment added notification
     */
    @Async
    public void sendCommentAddedEmail(Idea idea, User commenter, String commentText, User recipient) {
        if (!emailEnabled) {
            log.debug("Email notifications are disabled. Skipping comment added email.");
            return;
        }

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("recipientName", recipient.getFirstName());
            variables.put("ideaNumber", idea.getIdeaNumber());
            variables.put("ideaTitle", idea.getTitle());
            variables.put("commenterName", commenter.getFirstName() + " " + commenter.getLastName());
            variables.put("commentText", commentText);
            variables.put("commentDate", java.time.LocalDateTime.now().format(DATE_TIME_FORMATTER));
            variables.put("ideaUrl", getIdeaUrl(idea.getId()));

            String subject = "New Comment on: " + idea.getIdeaNumber();
            String content = buildEmailContent("comment-added", variables);

            sendEmail(recipient.getEmail(), subject, content);
            log.info("Comment added email sent to: {}", recipient.getEmail());
        } catch (Exception e) {
            log.error("Failed to send comment added email to: {}", recipient.getEmail(), e);
        }
    }

    /**
     * Send more information required notification
     */
    @Async
    public void sendMoreInfoRequiredEmail(Idea idea, String reviewerName, String requestedInfo) {
        if (!emailEnabled) {
            log.debug("Email notifications are disabled. Skipping more info required email.");
            return;
        }

        try {
            User owner = idea.getIdeaOwner();
            Map<String, Object> variables = new HashMap<>();
            variables.put("ownerName", owner.getFirstName());
            variables.put("ideaNumber", idea.getIdeaNumber());
            variables.put("ideaTitle", idea.getTitle());
            variables.put("reviewerName", reviewerName);
            variables.put("requestedInfo", requestedInfo);
            variables.put("requestDate", idea.getUpdatedAt().format(DATE_FORMATTER));
            variables.put("ideaUrl", getIdeaUrl(idea.getId()));

            String subject = "Additional Information Required: " + idea.getIdeaNumber();
            String content = buildEmailContent("more-info-required", variables);

            sendEmail(owner.getEmail(), subject, content);
            log.info("More info required email sent to: {}", owner.getEmail());
        } catch (Exception e) {
            log.error("Failed to send more info required email to: {}", idea.getIdeaOwner().getEmail(), e);
        }
    }

    /**
     * Send idea implemented notification
     */
    @Async
    public void sendIdeaImplementedEmail(Idea idea, String implementedBy) {
        if (!emailEnabled) {
            log.debug("Email notifications are disabled. Skipping idea implemented email.");
            return;
        }

        try {
            User owner = idea.getIdeaOwner();
            Map<String, Object> variables = new HashMap<>();
            variables.put("ownerName", owner.getFirstName());
            variables.put("ideaNumber", idea.getIdeaNumber());
            variables.put("ideaTitle", idea.getTitle());
            variables.put("implementedBy", implementedBy);
            variables.put("implementedDate", idea.getImplementationDate() != null ?
                idea.getImplementationDate().format(DATE_FORMATTER) : "Recently");
            variables.put("actualBenefits", formatCurrency(idea.getExpectedQuantitativeBenefitsValue()));
            variables.put("ideaUrl", getIdeaUrl(idea.getId()));

            String subject = "🎉 Idea Implemented: " + idea.getIdeaNumber();
            String content = buildEmailContent("idea-implemented", variables);

            sendEmail(owner.getEmail(), subject, content);
            log.info("Idea implemented email sent to: {}", owner.getEmail());
        } catch (Exception e) {
            log.error("Failed to send idea implemented email to: {}", idea.getIdeaOwner().getEmail(), e);
        }
    }

    /**
     * Build email content using template
     */
    private String buildEmailContent(String templateName, Map<String, Object> variables) {
        // Add common variables
        variables.put("applicationName", applicationName);
        variables.put("year", java.time.Year.now().getValue());
        variables.put("supportEmail", fromEmail);

        // For now, use simple HTML templates
        return buildSimpleHtmlTemplate(templateName, variables);
    }

    /**
     * Build simple HTML email template
     */
    private String buildSimpleHtmlTemplate(String templateName, Map<String, Object> variables) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='UTF-8'><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background: #2563eb; color: white; padding: 20px; text-align: center; }");
        html.append(".content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }");
        html.append(".button { display: inline-block; padding: 12px 24px; background: #2563eb; color: #000000; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }");
        html.append(".info-box { background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }");
        html.append(".footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }");
        html.append("</style></head><body><div class='container'>");

        // Header
        html.append("<div class='header'><h1>").append(applicationName).append("</h1></div>");
        html.append("<div class='content'>");

        // Template-specific content
        switch (templateName) {
            case "idea-submitted":
                html.append("<h2>New Idea Submitted</h2>");
                html.append("<p>Hello ").append(variables.get("recipientName")).append(",</p>");
                html.append("<p>A new idea has been submitted for review:</p>");
                html.append("<div class='info-box'>");
                html.append("<strong>Idea Number:</strong> ").append(variables.get("ideaNumber")).append("<br>");
                html.append("<strong>Title:</strong> ").append(variables.get("ideaTitle")).append("<br>");
                html.append("<strong>Submitted By:</strong> ").append(variables.get("submitterName")).append("<br>");
                html.append("<strong>Category:</strong> ").append(variables.get("category")).append("<br>");
                html.append("<strong>Date:</strong> ").append(variables.get("submittedDate"));
                html.append("</div>");
                break;

            case "approval-required":
                html.append("<h2>Approval Required</h2>");
                html.append("<p>Hello ").append(variables.get("reviewerName")).append(",</p>");
                html.append("<p>An idea requires your review and approval:</p>");
                html.append("<div class='info-box'>");
                html.append("<strong>Idea Number:</strong> ").append(variables.get("ideaNumber")).append("<br>");
                html.append("<strong>Title:</strong> ").append(variables.get("ideaTitle")).append("<br>");
                html.append("<strong>Submitted By:</strong> ").append(variables.get("submitterName")).append("<br>");
                html.append("<strong>Category:</strong> ").append(variables.get("category")).append("<br>");
                html.append("<strong>Expected Benefits:</strong> ").append(variables.get("expectedBenefits"));
                html.append("</div>");
                html.append("<p><strong>Problem Statement:</strong><br>").append(variables.get("problemStatement")).append("</p>");
                html.append("<p><strong>Proposed Solution:</strong><br>").append(variables.get("proposedSolution")).append("</p>");
                break;

            case "idea-approved":
                html.append("<h2>✅ Congratulations! Your Idea Has Been Approved</h2>");
                html.append("<p>Hello ").append(variables.get("ownerName")).append(",</p>");
                html.append("<p>Great news! Your idea has been approved:</p>");
                html.append("<div class='info-box'>");
                html.append("<strong>Idea Number:</strong> ").append(variables.get("ideaNumber")).append("<br>");
                html.append("<strong>Title:</strong> ").append(variables.get("ideaTitle")).append("<br>");
                html.append("<strong>Approved By:</strong> ").append(variables.get("approverName")).append("<br>");
                html.append("<strong>Date:</strong> ").append(variables.get("approvedDate"));
                html.append("</div>");
                html.append("<p><strong>Comments:</strong><br>").append(variables.get("comments")).append("</p>");
                html.append("<p><strong>Next Steps:</strong><br>").append(variables.get("nextSteps")).append("</p>");
                break;

            case "idea-rejected":
                html.append("<h2>Idea Requires Revision</h2>");
                html.append("<p>Hello ").append(variables.get("ownerName")).append(",</p>");
                html.append("<p>Your idea requires some revisions before it can be approved:</p>");
                html.append("<div class='info-box'>");
                html.append("<strong>Idea Number:</strong> ").append(variables.get("ideaNumber")).append("<br>");
                html.append("<strong>Title:</strong> ").append(variables.get("ideaTitle")).append("<br>");
                html.append("<strong>Reviewed By:</strong> ").append(variables.get("reviewerName")).append("<br>");
                html.append("<strong>Date:</strong> ").append(variables.get("rejectedDate"));
                html.append("</div>");
                html.append("<p><strong>Feedback:</strong><br>").append(variables.get("reason")).append("</p>");
                html.append("<p><strong>Next Steps:</strong><br>").append(variables.get("nextSteps")).append("</p>");
                break;

            case "status-changed":
                html.append("<h2>Status Update</h2>");
                html.append("<p>Hello ").append(variables.get("ownerName")).append(",</p>");
                html.append("<p>The status of your idea has been updated:</p>");
                html.append("<div class='info-box'>");
                html.append("<strong>Idea Number:</strong> ").append(variables.get("ideaNumber")).append("<br>");
                html.append("<strong>Title:</strong> ").append(variables.get("ideaTitle")).append("<br>");
                html.append("<strong>Previous Status:</strong> ").append(variables.get("oldStatus")).append("<br>");
                html.append("<strong>New Status:</strong> ").append(variables.get("newStatus")).append("<br>");
                html.append("<strong>Changed By:</strong> ").append(variables.get("changedBy")).append("<br>");
                html.append("<strong>Date:</strong> ").append(variables.get("changedDate"));
                html.append("</div>");
                break;

            case "comment-added":
                html.append("<h2>New Comment</h2>");
                html.append("<p>Hello ").append(variables.get("recipientName")).append(",</p>");
                html.append("<p>A new comment has been added to an idea:</p>");
                html.append("<div class='info-box'>");
                html.append("<strong>Idea Number:</strong> ").append(variables.get("ideaNumber")).append("<br>");
                html.append("<strong>Title:</strong> ").append(variables.get("ideaTitle")).append("<br>");
                html.append("<strong>Comment By:</strong> ").append(variables.get("commenterName")).append("<br>");
                html.append("<strong>Date:</strong> ").append(variables.get("commentDate"));
                html.append("</div>");
                html.append("<p><strong>Comment:</strong><br>").append(variables.get("commentText")).append("</p>");
                break;

            case "more-info-required":
                html.append("<h2>Additional Information Required</h2>");
                html.append("<p>Hello ").append(variables.get("ownerName")).append(",</p>");
                html.append("<p>The reviewer needs more information about your idea:</p>");
                html.append("<div class='info-box'>");
                html.append("<strong>Idea Number:</strong> ").append(variables.get("ideaNumber")).append("<br>");
                html.append("<strong>Title:</strong> ").append(variables.get("ideaTitle")).append("<br>");
                html.append("<strong>Requested By:</strong> ").append(variables.get("reviewerName")).append("<br>");
                html.append("<strong>Date:</strong> ").append(variables.get("requestDate"));
                html.append("</div>");
                html.append("<p><strong>Information Requested:</strong><br>").append(variables.get("requestedInfo")).append("</p>");
                break;

            case "idea-implemented":
                html.append("<h2>🎉 Your Idea Has Been Implemented!</h2>");
                html.append("<p>Hello ").append(variables.get("ownerName")).append(",</p>");
                html.append("<p>Congratulations! Your idea has been successfully implemented:</p>");
                html.append("<div class='info-box'>");
                html.append("<strong>Idea Number:</strong> ").append(variables.get("ideaNumber")).append("<br>");
                html.append("<strong>Title:</strong> ").append(variables.get("ideaTitle")).append("<br>");
                html.append("<strong>Implemented By:</strong> ").append(variables.get("implementedBy")).append("<br>");
                html.append("<strong>Date:</strong> ").append(variables.get("implementedDate")).append("<br>");
                html.append("<strong>Expected Benefits:</strong> ").append(variables.get("actualBenefits"));
                html.append("</div>");
                html.append("<p>Thank you for your contribution to continuous improvement!</p>");
                break;
        }

        // View Idea button
        html.append("<a href='").append(variables.get("ideaUrl")).append("' class='button'>View Idea Details</a>");

        html.append("</div>");

        // Footer
        html.append("<div class='footer'>");
        html.append("<p>This is an automated message from ").append(applicationName).append("</p>");
        html.append("<p>If you have questions, please contact <a href='mailto:").append(variables.get("supportEmail")).append("'>").append(variables.get("supportEmail")).append("</a></p>");
        html.append("<p>&copy; ").append(variables.get("year")).append(" ").append(applicationName).append(". All rights reserved.</p>");
        html.append("</div>");

        html.append("</div></body></html>");

        return html.toString();
    }

    /**
     * Send email using JavaMailSender
     */
    private void sendEmail(String to, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true); // true = HTML

        mailSender.send(message);
    }

    /**
     * Get idea URL
     */
    private String getIdeaUrl(Long ideaId) {
        return frontendUrl + "/ideas/" + ideaId;
    }

    /**
     * Format currency
     */
    private String formatCurrency(java.math.BigDecimal amount) {
        if (amount == null) {
            return "$0.00";
        }
        return String.format("$%,.2f", amount);
    }

    /**
     * Format status for display
     */
    private String formatStatus(String status) {
        if (status == null) {
            return "Unknown";
        }
        // Replace underscores with spaces and capitalize first letter of each word
        String[] words = status.replace("_", " ").toLowerCase().split(" ");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1))
                      .append(" ");
            }
        }
        return result.toString().trim();
    }
}

// Made with Bob
