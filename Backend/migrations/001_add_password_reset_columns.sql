-- Migration: Add password reset OTP columns to users table
-- Run this if you already have the database created from database.sql
-- and need to add the forgot-password feature columns.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS passwordResetOtp       VARCHAR(255) NULL AFTER twoFactorTempToken,
    ADD COLUMN IF NOT EXISTS passwordResetOtpExpiry DATETIME     NULL AFTER passwordResetOtp;
