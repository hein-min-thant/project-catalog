ALTER TABLE projects
DROP CONSTRAINT projects_status_check;

UPDATE projects
SET status = 'IN_PROGRESS'
WHERE status = 'in progress';

UPDATE projects
SET status = 'COMPLETED'
WHERE status = 'completed';

ALTER TABLE projects
ADD CONSTRAINT projects_status_check CHECK (status IN ('IN_PROGRESS', 'COMPLETED'));