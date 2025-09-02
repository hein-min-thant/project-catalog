-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT unique_course_per_dept UNIQUE (name, department_id)
);

-- Alter existing projects table
ALTER TABLE projects 
    ADD COLUMN department_id BIGINT,
    ADD COLUMN course_id BIGINT,
    ADD CONSTRAINT fk_projects_department FOREIGN KEY (department_id) REFERENCES departments(id),
    ADD CONSTRAINT fk_projects_course FOREIGN KEY (course_id) REFERENCES courses(id);
