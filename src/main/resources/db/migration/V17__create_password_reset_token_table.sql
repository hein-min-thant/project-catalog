CREATE TABLE password_reset_token (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    reset_code VARCHAR(6) NOT NULL,
    expiry_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '15 minutes'
);

CREATE UNIQUE INDEX idx_password_reset_token_email ON password_reset_token(email);


