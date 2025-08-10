CREATE TABLE registration_token (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 minutes'
);

CREATE UNIQUE INDEX idx_registration_token_email ON registration_token(email);

