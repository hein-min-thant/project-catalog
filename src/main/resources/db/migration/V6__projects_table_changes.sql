ALTER TABLE projects
DROP COLUMN start_date,
DROP COLUMN end_date;


ALTER TABLE projects
ADD COLUMN academic_year VARCHAR(10);

ALTER TABLE projects
ADD COLUMN student_year VARCHAR(20) CHECK (student_year IN ('First year', 'Second year', 'Third year', 'Fourth year', 'Final Year' , 'Master'));

