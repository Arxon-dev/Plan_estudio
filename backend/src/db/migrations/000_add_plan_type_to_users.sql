ALTER TABLE users ADD COLUMN plan_type ENUM('free', 'premium') DEFAULT 'free';
ALTER TABLE users ADD INDEX idx_plan_type (plan_type);
