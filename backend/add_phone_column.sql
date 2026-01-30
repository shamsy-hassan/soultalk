-- Migration: Add phone column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN phone TEXT UNIQUE;