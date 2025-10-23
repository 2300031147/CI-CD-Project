const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const { authMiddleware } = require('../middleware/auth');

// Get all songs with pagination and search
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM songs';
    let params = [];

    if (search) {
      query += ' WHERE title ILIKE $1 OR artist ILIKE $1 OR album ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ songs: result.rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get song by ID (with caching)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const redis = getRedisClient();

    // Try to get from cache
    if (redis && redis.isOpen) {
      const cached = await redis.get(`song:${id}`);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const result = await pool.query('SELECT * FROM songs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const song = result.rows[0];

    // Cache the result
    if (redis && redis.isOpen) {
      await redis.setEx(`song:${id}`, 3600, JSON.stringify(song));
    }

    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download song (requires authentication)
router.post('/:id/download', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Log download
    await pool.query(
      'INSERT INTO downloads (user_id, song_id) VALUES ($1, $2)',
      [userId, id]
    );

    // Increment download count
    await pool.query(
      'UPDATE songs SET downloads = downloads + 1 WHERE id = $1',
      [id]
    );

    res.json({ message: 'Download recorded', songId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream song (increment play count)
router.post('/:id/play', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE songs SET plays = plays + 1 WHERE id = $1',
      [id]
    );

    res.json({ message: 'Play recorded', songId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
