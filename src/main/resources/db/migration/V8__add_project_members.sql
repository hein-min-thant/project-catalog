CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    roll_number VARCHAR
);

CREATE TABLE project_members (
    project_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, member_id),
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
