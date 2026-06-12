-- Create Initial Tables for CIMS Application
-- Version: 1.0
-- Description: Creates core tables for users, roles, permissions, and categories

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    business_unit VARCHAR(100),
    location VARCHAR(100),
    manager_id BIGINT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(500),
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT FALSE,
    account_locked_until TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_token_expiry TIMESTAMP,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_changed_at TIMESTAMP,
    must_change_password BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    is_system_role BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    resource VARCHAR(50),
    action VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500),
    category_type VARCHAR(50),
    display_order INTEGER,
    color_code VARCHAR(20),
    icon VARCHAR(50),
    is_system_category BOOLEAN DEFAULT FALSE,
    parent_category_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create indexes for users table
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_employee_id ON users(employee_id);
CREATE INDEX idx_user_status ON users(status);
CREATE INDEX idx_user_department ON users(department);
CREATE INDEX idx_user_manager ON users(manager_id);

-- Create indexes for roles table
CREATE INDEX idx_role_name ON roles(name);

-- Create indexes for permissions table
CREATE INDEX idx_permission_name ON permissions(name);

-- Create indexes for categories table
CREATE INDEX idx_category_name ON categories(name);
CREATE INDEX idx_category_type ON categories(category_type);

-- Create sequence for idea number generation
CREATE SEQUENCE idea_number_seq START WITH 1 INCREMENT BY 1;

-- Add comments to tables
COMMENT ON TABLE users IS 'Stores user information and authentication details';
COMMENT ON TABLE roles IS 'Stores role definitions for RBAC';
COMMENT ON TABLE permissions IS 'Stores granular permissions';
COMMENT ON TABLE categories IS 'Stores configurable categories for various entities';

-- Made with Bob
