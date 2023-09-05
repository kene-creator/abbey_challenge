/*
  Warnings:

  - Added the required column `description` to the `partners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "base"."partners" ADD COLUMN     "description" TEXT NOT NULL;
