const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get all artists
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM artists';
    let params = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR genre ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ` ORDER BY followers DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ artists: result.rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get artist by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM artists WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Get artist songs
    const songsResult = await pool.query(
      'SELECT * FROM songs WHERE artist_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({ ...result.rows[0], songs: songsResult.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow artist
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already following
    const existing = await pool.query(
      'SELECT * FROM user_follows WHERE user_id = $1 AND artist_id = $2',
      [userId, id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this artist' });
    }

    // Add follow
    await pool.query(
      'INSERT INTO user_follows (user_id, artist_id) VALUES ($1, $2)',
      [userId, id]
    );

    // Increment follower count
    await pool.query(
      'UPDATE artists SET followers = followers + 1 WHERE id = $1',
      [id]
    );

    res.json({ message: 'Artist followed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow artist
router.delete('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM user_follows WHERE user_id = $1 AND artist_id = $2 RETURNING *',
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Not following this artist' });
    }

    // Decrement follower count
    await pool.query(
      'UPDATE artists SET followers = GREATEST(followers - 1, 0) WHERE id = $1',
      [id]
    );

    res.json({ message: 'Artist unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's followed artists
router.get('/me/following', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT a.* FROM artists a
       INNER JOIN user_follows uf ON a.id = uf.artist_id
       WHERE uf.user_id = $1
       ORDER BY uf.created_at DESC`,
      [userId]
    );

    res.json({ artists: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
