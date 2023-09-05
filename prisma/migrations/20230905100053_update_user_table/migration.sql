/*
  Warnings:

  - Added the required column `refreshToken` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "base"."users" ADD COLUMN     "refreshToken" TEXT NOT NULL;
