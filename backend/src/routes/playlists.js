const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get user's playlists
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ playlists: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create playlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      'INSERT INTO playlists (user_id, name, description, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, description, isPublic || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlistResult = await pool.query('SELECT * FROM playlists WHERE id = $1', [id]);
    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const playlist = playlistResult.rows[0];

    // Get songs in playlist
    const songsResult = await pool.query(
      `SELECT s.* FROM songs s 
       INNER JOIN playlist_songs ps ON s.id = ps.song_id 
       WHERE ps.playlist_id = $1 
       ORDER BY ps.position`,
      [id]
    );

    res.json({ ...playlist, songs: songsResult.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add song to playlist
router.post('/:id/songs', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const userId = req.user.id;

    // Verify playlist belongs to user
    const playlistResult = await pool.query(
      'SELECT * FROM playlists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (playlistResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get next position
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM playlist_songs WHERE playlist_id = $1',
      [id]
    );
    const position = positionResult.rows[0].next_position;

    // Add song to playlist
    await pool.query(
      'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES ($1, $2, $3)',
      [id, songId, position]
    );

    res.json({ message: 'Song added to playlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', authMiddleware, async (req, res) => {
  try {
    const { id, songId } = req.params;
    const userId = req.user.id;

    // Verify playlist belongs to user
    const playlistResult = await pool.query(
      'SELECT * FROM playlists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (playlistResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      [id, songId]
    );

    res.json({ message: 'Song removed from playlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete playlist
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM playlists WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
