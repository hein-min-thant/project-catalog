CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    role VARCHAR(50) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'SUPERVISOR')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE courses (

    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT unique_course_per_dept UNIQUE (name, department_id)
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    objectives TEXT,
    github_link VARCHAR(255),
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    body TEXT,
    cover_image_url VARCHAR(255),
    excerpt VARCHAR(500),
    academic_year VARCHAR(10),
    student_year VARCHAR(20) CHECK (student_year IN ('Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII', 'Semester IX', 'Semester X')),
    supervisor_id INT REFERENCES users(id),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_at TIMESTAMP,
    approved_by INT REFERENCES users(id),
    department_id BIGINT REFERENCES departments(id),
    course_id BIGINT REFERENCES courses(id)
);

CREATE TABLE reactions (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE project_tags (
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

CREATE TABLE saved_projects (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE TABLE registration_token (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 minutes'
);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    roll_number VARCHAR
);

CREATE TABLE project_members (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, member_id)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL REFERENCES users(id),
    message VARCHAR(255) NOT NULL,
    project_id BIGINT NOT NULL,
    comment_id BIGINT, -- Made nullable in V15
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'COMMENT',
    project_title VARCHAR(255),
    comment_text TEXT,
    commenter_name VARCHAR(255),
    approver_name VARCHAR(255),
    rejection_reason TEXT
);

CREATE TABLE password_reset_token (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    reset_code VARCHAR(6) NOT NULL,
    expiry_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '15 minutes'
);

CREATE UNIQUE INDEX idx_registration_token_email ON registration_token(email);
CREATE UNIQUE INDEX idx_password_reset_token_email ON password_reset_token(email);
CREATE INDEX idx_projects_body_search ON projects USING gin(to_tsvector('english', body));
CREATE INDEX idx_projects_supervisor_id ON projects(supervisor_id);
CREATE INDEX idx_projects_approval_status ON projects(approval_status);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_projects_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

