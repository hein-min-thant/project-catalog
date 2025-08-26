-- Add new notification fields
ALTER TABLE notifications 
ADD COLUMN notification_type VARCHAR(50) NOT NULL DEFAULT 'COMMENT',
ADD COLUMN project_title VARCHAR(255),
ADD COLUMN comment_text TEXT,
ADD COLUMN commenter_name VARCHAR(255),
ADD COLUMN approver_name VARCHAR(255),
ADD COLUMN rejection_reason TEXT;

-- Correctly modify the comment_id column to allow NULL values
ALTER TABLE notifications ALTER COLUMN comment_id DROP NOT NULL;
