ALTER TABLE projects ADD COLUMN body TEXT;
ALTER TABLE projects ADD COLUMN content_format VARCHAR(20) DEFAULT 'html'
    CHECK (content_format IN ('html', 'markdown', 'plaintext'));
ALTER TABLE projects ADD COLUMN cover_image_url VARCHAR(255);
ALTER TABLE projects ADD COLUMN excerpt VARCHAR(500);

UPDATE projects SET body = benefits WHERE benefits IS NOT NULL;

UPDATE projects SET content_format = 'html' WHERE body IS NOT NULL;

CREATE INDEX idx_projects_body_search ON projects USING gin(to_tsvector('english', body));


