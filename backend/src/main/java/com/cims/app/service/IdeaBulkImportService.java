package com.cims.app.service;

import com.cims.app.entity.Idea;
import com.cims.app.entity.User;
import com.cims.app.repository.IdeaRepository;
import com.cims.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Service for bulk importing ideas from Excel files
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IdeaBulkImportService {

    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;

    /**
     * Delete all ideas that were bulk imported
     * This will delete all ideas in the database
     * Use with caution - this is a destructive operation
     */
    @Transactional
    public BulkDeleteResult deleteAllBulkUploadedIdeas() {
        log.info("Starting deletion of all bulk uploaded ideas");
        
        BulkDeleteResult result = new BulkDeleteResult();
        
        try {
            // Get count before deletion
            long totalCount = ideaRepository.count();
            result.totalCount = (int) totalCount;
            
            log.info("Found {} ideas to delete", totalCount);
            
            // Delete all ideas
            ideaRepository.deleteAll();
            
            result.deletedCount = (int) totalCount;
            result.success = true;
            
            log.info("Successfully deleted {} ideas", totalCount);
            
        } catch (Exception e) {
            result.success = false;
            result.errorMessage = "Failed to delete bulk uploaded ideas: " + e.getMessage();
            log.error("Error deleting bulk uploaded ideas: {}", e.getMessage(), e);
        }
        
        return result;
    }

    @Transactional
    public BulkImportResult importIdeasFromExcel(MultipartFile file) throws IOException {
        log.info("Starting bulk import from file: {}", file.getOriginalFilename());
        
        BulkImportResult result = new BulkImportResult();
        User currentUser;
        
        try {
            currentUser = getCurrentUser();
            log.info("Current user for import: {}", currentUser.getEmail());
        } catch (Exception e) {
            log.error("Failed to get current user: {}", e.getMessage());
            throw new RuntimeException("Authentication required for bulk import", e);
        }
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            log.info("Processing sheet with {} rows", sheet.getLastRowNum() + 1);
            
            // Skip header row
            int rowNum = 1;
            for (Row row : sheet) {
                if (rowNum == 1) {
                    rowNum++;
                    continue;
                }
                
                // Skip empty rows
                if (row == null || isRowEmpty(row)) {
                    rowNum++;
                    continue;
                }
                
                try {
                    Idea idea = parseRowToIdea(row, currentUser);
                    if (idea != null && idea.getTitle() != null && !idea.getTitle().trim().isEmpty()) {
                        ideaRepository.save(idea);
                        result.successCount++;
                        log.debug("Successfully imported idea: {}", idea.getIdeaNumber());
                    } else {
                        log.warn("Skipping row {} - missing required fields", rowNum);
                    }
                } catch (Exception e) {
                    result.failureCount++;
                    result.errors.add("Row " + rowNum + ": " + e.getMessage());
                    log.error("Error importing row {}: {}", rowNum, e.getMessage(), e);
                }
                
                rowNum++;
            }
        }
        
        log.info("Bulk import completed. Success: {}, Failures: {}", result.successCount, result.failureCount);
        return result;
    }

    private Idea parseRowToIdea(Row row, User currentUser) {
        Idea idea = new Idea();
        
        // Column mapping based on the specified order
        idea.setIdeaNumber(getCellValueAsString(row.getCell(0)));
        idea.setCategory(getCellValueAsString(row.getCell(1)));
        idea.setIdentifiedBy(getCellValueAsString(row.getCell(2)));
        idea.setIdentifiedOn(getCellValueAsDate(row.getCell(3)));
        idea.setPodTeam(getCellValueAsString(row.getCell(4)));
        idea.setIbmDeliveryManager(getCellValueAsString(row.getCell(5)));
        idea.setSuncorManager(getCellValueAsString(row.getCell(6)));
        idea.setSuncorGm(getCellValueAsString(row.getCell(7)));
        idea.setApplicationName(getCellValueAsString(row.getCell(8)));
        idea.setConsultantName(getCellValueAsString(row.getCell(9)));
        idea.setTitle(getCellValueAsString(row.getCell(10)));
        idea.setProblemStatement(getCellValueAsString(row.getCell(11)));
        idea.setProposedSolution(getCellValueAsString(row.getCell(12)));
        idea.setActualSolutionImplemented(getCellValueAsString(row.getCell(13)));
        idea.setSupportingPodsTeams(getCellValueAsString(row.getCell(14)));
        idea.setServicenowTicket(getCellValueAsString(row.getCell(15)));
        idea.setExpectedQuantitativeBenefitsHours(getCellValueAsBigDecimal(row.getCell(16)));
        idea.setExpectedQuantitativeBenefitsValue(getCellValueAsBigDecimal(row.getCell(17)));
        idea.setExpectedQualitativeBenefits(getCellValueAsString(row.getCell(18)));
        idea.setBenefitType(getCellValueAsString(row.getCell(19)));
        idea.setEstimatedEffortsHours(getCellValueAsBigDecimal(row.getCell(20)));
        idea.setEstimatedEffortsValue(getCellValueAsBigDecimal(row.getCell(21)));
        idea.setActualEffortsSpentHours(getCellValueAsBigDecimal(row.getCell(22)));
        idea.setActualEffortsSpentValue(getCellValueAsBigDecimal(row.getCell(23)));
        idea.setImplementationDate(getCellValueAsDate(row.getCell(24)));
        idea.setStatus(getCellValueAsString(row.getCell(25)));
        idea.setSubStatus(getCellValueAsString(row.getCell(26)));
        idea.setRejectionReason(getCellValueAsString(row.getCell(27)));
        idea.setSuncorGoals(getCellValueAsString(row.getCell(28)));
        idea.setRemarks(getCellValueAsString(row.getCell(29)));
        
        // Set default values
        idea.setIdeaOwner(currentUser);
        idea.setCreatedBy(currentUser.getEmail());
        idea.setUpdatedBy(currentUser.getEmail());
        
        // Set default status if not provided
        if (idea.getStatus() == null || idea.getStatus().isEmpty()) {
            idea.setStatus("Draft");
        }
        
        // Generate idea number if not provided
        if (idea.getIdeaNumber() == null || idea.getIdeaNumber().isEmpty()) {
            idea.setIdeaNumber(generateIdeaNumber());
        }
        
        return idea;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }

    private LocalDate getCellValueAsDate(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        try {
            if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                Date date = cell.getDateCellValue();
                return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            } else if (cell.getCellType() == CellType.STRING) {
                // Try to parse string as date
                String dateStr = cell.getStringCellValue();
                return LocalDate.parse(dateStr);
            }
        } catch (Exception e) {
            log.warn("Could not parse date from cell: {}", e.getMessage());
        }
        
        return null;
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        try {
            BigDecimal value = null;
            
            if (cell.getCellType() == CellType.NUMERIC) {
                value = BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String strValue = cell.getStringCellValue().trim();
                if (!strValue.isEmpty()) {
                    // Remove currency symbols and commas
                    strValue = strValue.replaceAll("[^0-9.-]", "");
                    value = new BigDecimal(strValue);
                }
            }
            
            // Validate the value is within acceptable range
            if (value != null) {
                // Check if value is too large (max 15 digits before decimal for value fields)
                // This is a general check - specific fields may have tighter constraints
                if (value.abs().compareTo(new BigDecimal("999999999999999.99")) > 0) {
                    log.warn("Numeric value too large: {}. Max allowed: 999,999,999,999,999.99", value);
                    throw new IllegalArgumentException("Numeric value exceeds maximum allowed: " + value);
                }
            }
            
            return value;
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            log.warn("Could not parse number from cell: {}", e.getMessage());
        }
        
        return null;
    }

    private String generateIdeaNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long count = ideaRepository.count() + 1;
        return String.format("IDEA-%s-%04d", year, count);
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }
        for (int cellNum = 0; cellNum < row.getLastCellNum(); cellNum++) {
            Cell cell = row.getCell(cellNum);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellValueAsString(cell);
                if (value != null && !value.trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    /**
     * Result object for bulk import operation
     */
    public static class BulkImportResult {
        public int successCount = 0;
        public int failureCount = 0;
        public List<String> errors = new ArrayList<>();
        
        public int getSuccessCount() {
            return successCount;
        }
        
        public int getFailureCount() {
            return failureCount;
        }
        
        public List<String> getErrors() {
            return errors;
        }
    }

    /**
     * Result object for bulk delete operation
     */
    public static class BulkDeleteResult {
        public boolean success = false;
        public int totalCount = 0;
        public int deletedCount = 0;
        public String errorMessage = "";
        
        public boolean isSuccess() {
            return success;
        }
        
        public int getTotalCount() {
            return totalCount;
        }
        
        public int getDeletedCount() {
            return deletedCount;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
    }
}

// Made with Bob