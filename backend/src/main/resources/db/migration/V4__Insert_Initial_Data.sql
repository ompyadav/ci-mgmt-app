-- Insert Initial Data
-- Version: 4.0
-- Description: Inserts default roles, permissions, categories, and admin user

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action, is_active, created_at, updated_at) VALUES
-- User Management
('USER_CREATE', 'Create new users', 'USER', 'CREATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USER_READ', 'View user details', 'USER', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USER_UPDATE', 'Update user information', 'USER', 'UPDATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USER_DELETE', 'Delete users', 'USER', 'DELETE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Idea Management
('IDEA_CREATE', 'Create new ideas', 'IDEA', 'CREATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IDEA_READ', 'View idea details', 'IDEA', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IDEA_UPDATE', 'Update idea information', 'IDEA', 'UPDATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IDEA_DELETE', 'Delete ideas', 'IDEA', 'DELETE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IDEA_APPROVE', 'Approve ideas', 'IDEA', 'APPROVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IDEA_REJECT', 'Reject ideas', 'IDEA', 'REJECT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Dashboard
('DASHBOARD_VIEW', 'View dashboard', 'DASHBOARD', 'VIEW', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DASHBOARD_EXECUTIVE', 'View executive dashboard', 'DASHBOARD', 'VIEW_EXECUTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reports
('REPORT_VIEW', 'View reports', 'REPORT', 'VIEW', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('REPORT_EXPORT', 'Export reports', 'REPORT', 'EXPORT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Configuration
('CONFIG_MANAGE', 'Manage system configuration', 'CONFIG', 'MANAGE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ROLE_MANAGE', 'Manage roles and permissions', 'ROLE', 'MANAGE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Audit
('AUDIT_VIEW', 'View audit logs', 'AUDIT', 'VIEW', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default roles
INSERT INTO roles (name, description, is_system_role, is_active, created_at, updated_at) VALUES
('ROLE_ADMIN', 'System Administrator with full access', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ROLE_MANAGER', 'Manager with review and approval rights', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ROLE_USER', 'Standard user with basic access', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ROLE_EXECUTIVE', 'Executive with dashboard access', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ROLE_REVIEWER', 'Reviewer with idea review rights', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign permissions to ROLE_ADMIN (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_ADMIN';

-- Assign permissions to ROLE_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_MANAGER'
AND p.name IN (
    'USER_READ', 'IDEA_CREATE', 'IDEA_READ', 'IDEA_UPDATE', 
    'IDEA_APPROVE', 'IDEA_REJECT', 'DASHBOARD_VIEW', 
    'REPORT_VIEW', 'REPORT_EXPORT'
);

-- Assign permissions to ROLE_USER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_USER'
AND p.name IN (
    'IDEA_CREATE', 'IDEA_READ', 'IDEA_UPDATE', 'DASHBOARD_VIEW'
);

-- Assign permissions to ROLE_EXECUTIVE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_EXECUTIVE'
AND p.name IN (
    'IDEA_READ', 'DASHBOARD_VIEW', 'DASHBOARD_EXECUTIVE', 
    'REPORT_VIEW', 'REPORT_EXPORT'
);

-- Assign permissions to ROLE_REVIEWER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_REVIEWER'
AND p.name IN (
    'IDEA_READ', 'IDEA_UPDATE', 'IDEA_APPROVE', 'IDEA_REJECT', 
    'DASHBOARD_VIEW', 'REPORT_VIEW'
);

-- Insert default categories for ideas
INSERT INTO categories (name, description, category_type, display_order, color_code, is_system_category, is_active, created_at, updated_at) VALUES
('Automation', 'Process automation initiatives', 'IDEA_CATEGORY', 1, '#4CAF50', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Gen AI', 'Generative AI solutions', 'IDEA_CATEGORY', 2, '#2196F3', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Business Process Improvement', 'Business process optimization', 'IDEA_CATEGORY', 3, '#FF9800', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IT Process Improvement', 'IT process optimization', 'IDEA_CATEGORY', 4, '#9C27B0', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Process Improvement', 'General process improvements', 'IDEA_CATEGORY', 5, '#00BCD4', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Reliability', 'System reliability enhancements', 'IDEA_CATEGORY', 6, '#F44336', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Innovation', 'Innovative solutions', 'IDEA_CATEGORY', 7, '#E91E63', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default statuses
INSERT INTO categories (name, description, category_type, display_order, is_system_category, is_active, created_at, updated_at) VALUES
('Draft', 'Idea in draft state', 'STATUS', 1, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Under Review', 'Idea under review', 'STATUS', 2, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Approved', 'Idea approved', 'STATUS', 3, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Under Development', 'Idea being implemented', 'STATUS', 4, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('On Hold', 'Idea on hold', 'STATUS', 5, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Rejected', 'Idea rejected', 'STATUS', 6, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Implemented', 'Idea implemented', 'STATUS', 7, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Closed', 'Idea closed', 'STATUS', 8, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default sub-statuses
INSERT INTO categories (name, description, category_type, display_order, is_system_category, is_active, created_at, updated_at) VALUES
('SD', 'Service Desk', 'SUB_STATUS', 1, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PO', 'Product Owner', 'SUB_STATUS', 2, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Business', 'Business Team', 'SUB_STATUS', 3, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CCB', 'Change Control Board', 'SUB_STATUS', 4, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IBM Internal', 'IBM Internal Review', 'SUB_STATUS', 5, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert benefit types
INSERT INTO categories (name, description, category_type, display_order, is_system_category, is_active, created_at, updated_at) VALUES
('One Time', 'One-time benefit', 'BENEFIT_TYPE', 1, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Recurring', 'Recurring benefit', 'BENEFIT_TYPE', 2, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert priority levels
INSERT INTO categories (name, description, category_type, display_order, color_code, is_system_category, is_active, created_at, updated_at) VALUES
('LOW', 'Low priority', 'PRIORITY', 1, '#4CAF50', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MEDIUM', 'Medium priority', 'PRIORITY', 2, '#FF9800', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HIGH', 'High priority', 'PRIORITY', 3, '#F44336', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CRITICAL', 'Critical priority', 'PRIORITY', 4, '#9C27B0', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert complexity levels
INSERT INTO categories (name, description, category_type, display_order, is_system_category, is_active, created_at, updated_at) VALUES
('COMPLEXITY_LOW', 'Low complexity', 'COMPLEXITY', 1, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('COMPLEXITY_MEDIUM', 'Medium complexity', 'COMPLEXITY', 2, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('COMPLEXITY_HIGH', 'High complexity', 'COMPLEXITY', 3, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default admin user (password: Admin@123)
-- Password is BCrypt hash of 'Admin@123'
INSERT INTO users (
    employee_id, first_name, last_name, email, password,
    department, status, email_verified, is_active,
    created_at, updated_at, created_by
) VALUES (
    'ADMIN001', 'System', 'Administrator', 'admin@cims.com',
    '$2a$10$eDQuqWaX3fB6tsF1B6gWxu2BX1QsX809VDmpUBckZ50wgW5..iq4K',
    'IT', 'ACTIVE', true, true,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM'
);

-- Assign ROLE_ADMIN to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.employee_id = 'ADMIN001'
AND r.name = 'ROLE_ADMIN';

-- Log initial data creation
INSERT INTO audit_logs (
    username, action, entity_type, entity_name, 
    timestamp, status, module
) VALUES (
    'SYSTEM', 'INITIAL_SETUP', 'SYSTEM', 'Initial data creation',
    CURRENT_TIMESTAMP, 'SUCCESS', 'SYSTEM'
);

-- Made with Bob
