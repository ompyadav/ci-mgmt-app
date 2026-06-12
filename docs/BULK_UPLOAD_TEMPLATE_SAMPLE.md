# Bulk Upload Template - Sample Data

## Excel Column Structure (30 columns)

The bulk upload Excel file should have the following columns in this exact order:

| Column # | Column Name | Description | Sample Data |
|----------|-------------|-------------|-------------|
| 1 | Idea Number | Unique identifier (auto-generated if empty) | IDEA-2026-0001 |
| 2 | Category | Idea category | Automation |
| 3 | Identified By | Who identified (IBM/Suncor) | IBM |
| 4 | Identified On | Date identified | 2026-01-15 |
| 5 | Pod/Team | Team name | Cloud Infrastructure Team |
| 6 | IBM Delivery Manager | Manager name | John Smith |
| 7 | Suncor Manager | Suncor manager | Sarah Johnson |
| 8 | Suncor GM | General Manager | Michael Brown |
| 9 | Application Name | Application | SAP ERP System |
| 10 | Consultant Name | Consultant | David Lee |
| 11 | Title | Idea title | Automate Daily Report Generation |
| 12 | Problem Statement | Problem description | Manual report generation takes 2 hours daily |
| 13 | Proposed Solution | Solution description | Implement automated Python script |
| 14 | Actual Solution Implemented | Implementation details | Created scheduled task with Python automation |
| 15 | Supporting Pods/Teams | Other teams involved | DevOps, QA Team |
| 16 | ServiceNow Ticket | Ticket number | INC0012345 |
| 17 | Expected Quantitative Benefits (Hours) | Hours saved | 40 |
| 18 | Expected Quantitative Benefits (Value) | Dollar value | 5000 |
| 19 | Expected Qualitative Benefits | Quality improvements | Reduced errors, faster delivery |
| 20 | Benefit Type | One Time / Recurring | Recurring |
| 21 | Estimated Efforts (Hours) | Hours to implement | 20 |
| 22 | Estimated Efforts (Value) | Implementation cost | 2500 |
| 23 | Actual Efforts Spent (Hours) | Actual hours | 18 |
| 24 | Actual Efforts Spent (Value) | Actual cost | 2250 |
| 25 | Implementation Date | Date implemented | 2026-02-01 |
| 26 | Status | Current status | Implemented |
| 27 | Sub Status | Sub-status | SD |
| 28 | Rejection Reason | If rejected | (empty) |
| 29 | Suncor Goals | Alignment with goals | Cost reduction, efficiency improvement |
| 30 | Remarks | Additional notes | Successfully deployed to production |

## Sample Data Rows

### Row 1: Automation Idea
```
IDEA-2026-0001 | Automation | IBM | 2026-01-15 | Cloud Infrastructure Team | John Smith | Sarah Johnson | Michael Brown | SAP ERP System | David Lee | Automate Daily Report Generation | Manual report generation takes 2 hours daily | Implement automated Python script | Created scheduled task with Python automation | DevOps, QA Team | INC0012345 | 40 | 5000 | Reduced errors, faster delivery | Recurring | 20 | 2500 | 18 | 2250 | 2026-02-01 | Implemented | SD | | Cost reduction, efficiency improvement | Successfully deployed to production
```

### Row 2: Gen AI Idea
```
IDEA-2026-0002 | Gen AI | Suncor | 2026-01-20 | AI Innovation Team | Emily Davis | Robert Wilson | Jennifer Taylor | Customer Portal | Maria Garcia | AI-Powered Chatbot for Customer Support | Customers wait 30+ minutes for support | Deploy GPT-based chatbot for common queries | Integrated ChatGPT API with custom training | Customer Service, IT Support | REQ0045678 | 160 | 20000 | 24/7 availability, instant responses | Recurring | 80 | 10000 | 75 | 9375 | 2026-03-15 | Implemented | Business | | Customer satisfaction, cost savings | 85% query resolution rate achieved
```

### Row 3: Process Improvement Idea
```
IDEA-2026-0003 | Process Improvement | IBM | 2026-02-01 | Operations Team | Thomas Anderson | Lisa Martinez | James Clark | Inventory System | Kevin White | Streamline Approval Workflow | 5-step approval process causes delays | Reduce to 3-step approval with automation | Implemented workflow engine with auto-routing | Finance, Procurement | CHG0098765 | 100 | 12500 | Faster approvals, better tracking | Recurring | 40 | 5000 | 35 | 4375 | 2026-03-01 | Implemented | PO | | Process efficiency, time savings | Approval time reduced by 60%
```

### Row 4: Reliability Improvement
```
IDEA-2026-0004 | Reliability | IBM | 2026-02-10 | Infrastructure Team | Daniel Kim | Patricia Moore | Richard Hall | Production Database | Jessica Chen | Implement Database Monitoring Solution | Frequent undetected database issues | Deploy real-time monitoring with alerts | Configured Prometheus + Grafana monitoring | DBA Team, DevOps | INC0123456 | 80 | 10000 | Proactive issue detection, reduced downtime | One Time | 60 | 7500 | 55 | 6875 | 2026-03-20 | Implemented | CCB | | System reliability, uptime improvement | 99.9% uptime achieved
```

### Row 5: Innovation Idea
```
IDEA-2026-0005 | Innovation | Suncor | 2026-02-15 | Digital Transformation | Christopher Lee | Amanda Scott | William Turner | Mobile App | Rachel Adams | Implement Biometric Authentication | Password-based login has security risks | Add fingerprint/face recognition login | Integrated biometric SDK for iOS/Android | Security Team, Mobile Dev | REQ0067890 | 50 | 6250 | Enhanced security, better UX | One Time | 100 | 12500 | 95 | 11875 | 2026-04-01 | Implemented | IBM Internal | | Security enhancement, user experience | 95% user adoption rate
```

## Valid Values for Key Fields

### Categories
- Automation
- Gen AI
- Business Process Improvement
- IT Process Improvement
- Process Improvement
- Reliability
- Innovation

### Status Values
- Draft
- Under Review
- Approved
- Under Development
- On Hold
- Rejected
- Implemented
- Closed

### Sub-Status Values
- SD (Service Desk)
- PO (Product Owner)
- Business
- CCB (Change Control Board)
- IBM Internal

### Benefit Types
- One Time
- Recurring

### Identified By
- IBM
- Suncor

## Notes
1. **Idea Number**: Leave empty for auto-generation or provide unique number
2. **Dates**: Use format YYYY-MM-DD (e.g., 2026-01-15)
3. **Numeric Values**: Use numbers without currency symbols or commas
4. **Required Fields**: Title, Category are mandatory
5. **Status**: Defaults to "Draft" if not provided
6. **Empty Fields**: Leave cells empty if no data (don't use "N/A" or "-")

## Creating the Excel File

1. Create a new Excel file (.xlsx)
2. Add headers in Row 1 (all 30 column names)
3. Add data starting from Row 2
4. Save the file
5. Upload via the bulk import endpoint

## Example Excel Structure

```
Row 1 (Headers):
Idea Number | Category | Identified By | Identified On | Pod/Team | ... (30 columns total)

Row 2 (Data):
IDEA-2026-0001 | Automation | IBM | 2026-01-15 | Cloud Team | ...

Row 3 (Data):
IDEA-2026-0002 | Gen AI | Suncor | 2026-01-20 | AI Team | ...
```

Save this as an Excel file and use it for bulk upload testing!