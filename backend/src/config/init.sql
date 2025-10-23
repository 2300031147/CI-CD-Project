-- Create tables for music streaming platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  genre VARCHAR(100),
  image_url VARCHAR(500),
  followers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_id INTEGER REFERENCES artists(id) ON DELETE SET NULL,
  album VARCHAR(255),
  genre VARCHAR(100),
  duration INTEGER, -- in seconds
  file_url VARCHAR(500),
  cover_url VARCHAR(500),
  plays INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist songs junction table
CREATE TABLE IF NOT EXISTS playlist_songs (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(playlist_id, song_id)
);

-- User follows artists
CREATE TABLE IF NOT EXISTS user_follows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, artist_id)
);

-- Downloads tracking
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  plan VARCHAR(50) NOT NULL,
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_artist_id ON user_follows(artist_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);

-- Insert sample data

-- Sample artists
INSERT INTO artists (name, bio, genre, followers) VALUES
  ('The Midnight', 'Synthwave duo creating nostalgic electronic music', 'Synthwave', 10000),
  ('Billie Eilish', 'Grammy-winning pop artist', 'Pop', 50000),
  ('Hans Zimmer', 'Legendary film composer', 'Classical', 30000),
  ('Daft Punk', 'French electronic music duo', 'Electronic', 80000),
  ('Taylor Swift', 'Multi-platinum pop star', 'Pop', 100000)
ON CONFLICT DO NOTHING;

-- Sample songs
INSERT INTO songs (title, artist, artist_id, album, genre, duration, plays, downloads) VALUES
  ('Sunset', 'The Midnight', 1, 'Endless Summer', 'Synthwave', 240, 5000, 1000),
  ('bad guy', 'Billie Eilish', 2, 'When We All Fall Asleep', 'Pop', 194, 10000, 3000),
  ('Time', 'Hans Zimmer', 3, 'Inception OST', 'Classical', 276, 8000, 2000),
  ('One More Time', 'Daft Punk', 4, 'Discovery', 'Electronic', 320, 15000, 5000),
  ('Shake It Off', 'Taylor Swift', 5, '1989', 'Pop', 219, 20000, 8000),
  ('Ocean Eyes', 'Billie Eilish', 2, 'Ocean Eyes EP', 'Pop', 201, 12000, 4000),
  ('Interstellar Theme', 'Hans Zimmer', 3, 'Interstellar OST', 'Classical', 298, 9000, 2500),
  ('Around the World', 'Daft Punk', 4, 'Homework', 'Electronic', 429, 11000, 3500),
  ('Blank Space', 'Taylor Swift', 5, '1989', 'Pop', 232, 18000, 7000),
  ('Nights', 'The Midnight', 1, 'Nocturnal', 'Synthwave', 256, 6000, 1500)
ON CONFLICT DO NOTHING;
