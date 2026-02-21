-- backend/add_profile_picture_url_column.sql
-- SQL to add a profile_picture_url column to the users table

ALTER TABLE users ADD COLUMN profile_picture_url TEXT;

-- You might also want to add a default value for existing users
-- ALTER TABLE users ADD COLUMN profile_picture_url TEXT DEFAULT 'default_profile.png';
