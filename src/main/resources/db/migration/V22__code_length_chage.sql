ALTER TABLE courses DROP CONSTRAINT courses_code_key;


ALTER TABLE courses ALTER COLUMN code TYPE VARCHAR(50);

ALTER TABLE courses ADD CONSTRAINT courses_code_key UNIQUE (code);