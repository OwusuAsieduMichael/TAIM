-- Passport document scan removed; only portrait photo URL remains on Student.
ALTER TABLE "Student" DROP COLUMN IF EXISTS "passportDocumentUrl";
