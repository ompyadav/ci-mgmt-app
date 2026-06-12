-- Create Ideas and Related Tables
-- Version: 2.0
-- Description: Creates tables for ideas, attachments, comments, and workflow history

-- Create ideas table
CREATE TABLE ideas (
    id BIGSERIAL PRIMARY KEY,
    idea_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    identified_by VARCHAR(50),
    identified_on DATE,
    pod_team VARCHAR(100),
    ibm_delivery_manager VARCHAR(100),
    suncor_manager VARCHAR(100),
    suncor_gm VARCHAR(100),
    application_name VARCHAR(200),
    consultant_name VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    problem_statement TEXT,
    proposed_solution TEXT,
    actual_solution_implemented TEXT,
    supporting_pods_teams VARCHAR(500),
    servicenow_ticket VARCHAR(100),
    expected_quantitative_benefits_hours NUMERIC(10, 2),
    expected_quantitative_benefits_value NUMERIC(15, 2),
    expected_qualitative_benefits TEXT,
    benefit_type VARCHAR(50),
    estimated_efforts_hours NUMERIC(10, 2),
    estimated_efforts_value NUMERIC(15, 2),
    actual_efforts_spent_hours NUMERIC(10, 2),
    actual_efforts_spent_value NUMERIC(15, 2),
    implementation_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    sub_status VARCHAR(50),
    rejection_reason TEXT,
    suncor_goals TEXT,
    remarks TEXT,
    idea_owner_id BIGINT,
    reviewer_id BIGINT,
    actual_quantitative_benefits_hours NUMERIC(10, 2),
    actual_quantitative_benefits_value NUMERIC(15, 2),
    roi_percentage NUMERIC(5, 2),
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    complexity VARCHAR(20),
    impact_score NUMERIC(3, 1),
    feasibility_score NUMERIC(3, 1),
    submitted_date DATE,
    approved_date DATE,
    rejected_date DATE,
    closed_date DATE,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_date DATE,
    tags VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (idea_owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create idea_attachments table
CREATE TABLE idea_attachments (
    id BIGSERIAL PRIMARY KEY,
    idea_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    content_type VARCHAR(100),
    description VARCHAR(500),
    uploaded_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create idea_comments table
CREATE TABLE idea_comments (
    id BIGSERIAL PRIMARY KEY,
    idea_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    parent_comment_id BIGINT,
    is_edited BOOLEAN DEFAULT FALSE,
    mentioned_users VARCHAR(500),
    attachment_url VARCHAR(500),
    is_internal BOOLEAN DEFAULT FALSE,
    comment_type VARCHAR(50) DEFAULT 'GENERAL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES idea_comments(id) ON DELETE CASCADE
);

-- Create idea_workflow_history table
CREATE TABLE idea_workflow_history (
    id BIGSERIAL PRIMARY KEY,
    idea_id BIGINT NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    from_sub_status VARCHAR(50),
    to_sub_status VARCHAR(50),
    changed_by BIGINT,
    comments TEXT,
    action_type VARCHAR(50),
    duration_in_status BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for ideas table
CREATE INDEX idx_idea_number ON ideas(idea_number);
CREATE INDEX idx_idea_status ON ideas(status);
CREATE INDEX idx_idea_category ON ideas(category);
CREATE INDEX idx_idea_owner ON ideas(idea_owner_id);
CREATE INDEX idx_idea_reviewer ON ideas(reviewer_id);
CREATE INDEX idx_idea_created_at ON ideas(created_at);
CREATE INDEX idx_idea_priority ON ideas(priority);
CREATE INDEX idx_idea_submitted_date ON ideas(submitted_date);

-- Create indexes for idea_attachments table
CREATE INDEX idx_attachment_idea ON idea_attachments(idea_id);
CREATE INDEX idx_attachment_uploaded_by ON idea_attachments(uploaded_by);

-- Create indexes for idea_comments table
CREATE INDEX idx_comment_idea ON idea_comments(idea_id);
CREATE INDEX idx_comment_user ON idea_comments(user_id);
CREATE INDEX idx_comment_parent ON idea_comments(parent_comment_id);

-- Create indexes for idea_workflow_history table
CREATE INDEX idx_workflow_idea ON idea_workflow_history(idea_id);
CREATE INDEX idx_workflow_date ON idea_workflow_history(created_at);
CREATE INDEX idx_workflow_action ON idea_workflow_history(action_type);

-- Add comments to tables
COMMENT ON TABLE ideas IS 'Stores continuous improvement ideas and their details';
COMMENT ON TABLE idea_attachments IS 'Stores file attachments for ideas';
COMMENT ON TABLE idea_comments IS 'Stores comments and discussions on ideas';
COMMENT ON TABLE idea_workflow_history IS 'Tracks workflow state changes for ideas';

-- Made with Bob
