-- Lists seeded demo learners shown in the teacher attendance UI (JHS1-A, demo-school).
-- Source of truth for names/admission numbers: apps/api/prisma/seed.ts
-- Prerequisite: run `npx prisma db seed` from apps/api so these rows exist.
-- Run in Supabase → SQL Editor or psql against the same DATABASE_URL.

-- By school slug + class name (portable if class PK ever changes)
SELECT
  s.id AS student_id,
  s."admissionNumber" AS admission_number,
  s."firstName" AS first_name,
  s."lastName" AS last_name,
  u."fullName" AS display_name,
  c.name AS class_name,
  c.level AS class_level,
  sch.slug AS school_slug,
  s."classId" AS class_id
FROM "Student" s
JOIN "User" u ON u.id = s."userId"
JOIN "School" sch ON sch.id = s."schoolId"
LEFT JOIN "Class" c ON c.id = s."classId"
WHERE sch.slug = 'demo-school'
  AND c.name = 'JHS1-A'
ORDER BY s."admissionNumber";

-- Same roster, fixed seed class id (matches prisma/seed.ts `seed-class`)
-- SELECT
--   s."admissionNumber",
--   s."firstName",
--   s."lastName",
--   u."fullName"
-- FROM "Student" s
-- JOIN "User" u ON u.id = s."userId"
-- WHERE s."classId" = 'seed-class'
-- ORDER BY s."admissionNumber";
