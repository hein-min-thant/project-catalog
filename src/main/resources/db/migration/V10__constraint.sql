ALTER TABLE projects
ADD CONSTRAINT chk_student_year CHECK (student_year IN ('First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Final Year', 'Master'));