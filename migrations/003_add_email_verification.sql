ALTER TABLE users
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN verification_token TEXT;

ALTER TABLE users
ADD COLUMN verification_token_expires TIMESTAMP;