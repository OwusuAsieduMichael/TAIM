-- Run this in Supabase → SQL Editor if `npx prisma migrate deploy` cannot reach :5432 from your network.
-- Then re-seed if you want demo passport photo URL: `npx prisma db seed`

ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "passportPhotoUrl" TEXT;
ALTER TABLE "Student" DROP COLUMN IF EXISTS "passportDocumentUrl";
