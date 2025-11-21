-- Migration: Add Premium Subscription Columns to Users Table
-- Date: 2025-11-20
-- Description: Adds columns needed for Stripe premium subscription functionality

USE u449034524_plan_estudio;

-- Add premium-related columns to users table
ALTER TABLE users
ADD COLUMN isPremium TINYINT(1) NOT NULL DEFAULT 0 AFTER isAdmin,
ADD COLUMN stripeCustomerId VARCHAR(255) NULL AFTER isPremium,
ADD COLUMN subscriptionStatus VARCHAR(50) NULL AFTER stripeCustomerId,
ADD COLUMN subscriptionEndDate DATETIME NULL AFTER subscriptionStatus;

-- Add indexes for better query performance
CREATE INDEX idx_users_isPremium ON users(isPremium);
CREATE INDEX idx_users_stripeCustomerId ON users(stripeCustomerId);
CREATE INDEX idx_users_subscriptionStatus ON users(subscriptionStatus);

-- Verify the changes
DESCRIBE users;

-- Optional: Show sample of updated table structure
SELECT 
    id, 
    email, 
    isPremium, 
    stripeCustomerId, 
    subscriptionStatus, 
    subscriptionEndDate 
FROM users 
LIMIT 5;
