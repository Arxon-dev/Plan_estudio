CREATE TABLE IF NOT EXISTS flashcard_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  flashcard_id VARCHAR(100) NOT NULL,
  last_reviewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_card (user_id, flashcard_id)
);
