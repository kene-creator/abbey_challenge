/*
  Warnings:

  - The primary key for the `partners` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "base"."partners" DROP CONSTRAINT "partners_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "partners_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "partners_id_seq";
