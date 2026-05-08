-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'PATIENT');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('SIGN_UP', 'RESET_PASSWOED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PATIENT',
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "refreshToken" TEXT,
    "resetpasswordToken" TEXT,
    "resetpasswordExpire" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verificationCode" TEXT,
    "otpPurpose" "OtpPurpose",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
