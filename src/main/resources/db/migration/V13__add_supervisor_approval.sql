-- Add supervisor and approval fields to projects table
ALTER TABLE projects
ADD COLUMN supervisor_id INT REFERENCES users(id),
ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN approved_by INT REFERENCES users(id);

-- Add index for better performance on supervisor queries
CREATE INDEX idx_projects_supervisor_id ON projects(supervisor_id);
CREATE INDEX idx_projects_approval_status ON projects(approval_status);
