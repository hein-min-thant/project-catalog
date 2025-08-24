CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    project_id BIGINT NOT NULL,
    comment_id BIGINT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipient_user
        FOREIGN KEY(recipient_user_id)
        REFERENCES users(id)
);