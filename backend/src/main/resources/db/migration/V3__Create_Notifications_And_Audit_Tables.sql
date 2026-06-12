-- Create Notifications and Audit Tables
-- Version: 3.0
-- Description: Creates tables for notifications and audit logging

-- Create notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    reference_type VARCHAR(50),
    reference_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    action_url VARCHAR(500),
    icon VARCHAR(50),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    entity_name VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    error_message TEXT,
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    session_id VARCHAR(100),
    module VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for notifications table
CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_read ON notifications(is_read);
CREATE INDEX idx_notification_created ON notifications(created_at);
CREATE INDEX idx_notification_type ON notifications(notification_type);
CREATE INDEX idx_notification_priority ON notifications(priority);

-- Create indexes for audit_logs table
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_module ON audit_logs(module);
CREATE INDEX idx_audit_username ON audit_logs(username);

-- Add comments to tables
COMMENT ON TABLE notifications IS 'Stores in-app notifications for users';
COMMENT ON TABLE audit_logs IS 'Stores audit trail of all system activities';

-- Create function to automatically delete old audit logs (optional)
CREATE OR REPLACE FUNCTION delete_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically delete old notifications (optional)
CREATE OR REPLACE FUNCTION delete_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications 
    WHERE is_read = TRUE 
    AND created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Made with Bob
