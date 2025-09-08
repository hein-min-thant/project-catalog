ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_student_year;

-- Add the new constraint for semester-based values
ALTER TABLE projects
ADD CONSTRAINT chk_student_year CHECK (
  student_year IN (
    'Semester I', 'Semester II', 'Semester III', 'Semester IV',
    'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII', 'Semester IX' , 'Internship', 'Final Project'
  )
);