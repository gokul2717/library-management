-- ================================================================
-- Central Library — MySQL Schema
-- Database: library_db
-- ================================================================

CREATE DATABASE IF NOT EXISTS library_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE library_db;

CREATE TABLE IF NOT EXISTS books (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  author          VARCHAR(150) NOT NULL,
  category        VARCHAR(50)  NOT NULL,
  language        VARCHAR(50)  DEFAULT 'english',
  printed_year    INT,
  description     TEXT,
  image_url       VARCHAR(500),
  status          ENUM('available','issued') DEFAULT 'available',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_category (category),
  INDEX idx_author (author),
  INDEX idx_language (language),
  INDEX idx_name (name)
) ENGINE=InnoDB;

INSERT INTO books (name, author, category, language, printed_year, description, status)
VALUES
('The Alchemist', 'Paulo Coelho', 'fiction', 'english', 1988,
 'A philosophical novel about following your dreams and listening to your heart.', 'available'),

('Wings of Fire', 'A.P.J. Abdul Kalam', 'biography', 'english', 1999,
 'The autobiography of India''s Missile Man — an inspiring journey of a scientist.', 'available'),

('Clean Code', 'Robert C. Martin', 'technology', 'english', 2008,
 'A handbook of agile software craftsmanship — writing code that humans can read.', 'issued'),

('Thirukkural', 'Thiruvalluvar', 'reference', 'tamil', 300,
 'A classic Tamil text consisting of 1,330 couplets on ethics, politics, and love.', 'available');