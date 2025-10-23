const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const { authMiddleware } = require('../middleware/auth');

// AI-based recommendation engine
const getRecommendations = async (userId) => {
  // Get user's listening history
  const historyResult = await pool.query(
    `SELECT DISTINCT s.genre, s.artist_id, COUNT(*) as play_count
     FROM songs s
     INNER JOIN downloads d ON s.id = d.song_id
     WHERE d.user_id = $1
     GROUP BY s.genre, s.artist_id
     ORDER BY play_count DESC
     LIMIT 5`,
    [userId]
  );

  if (historyResult.rows.length === 0) {
    // If no history, return popular songs
    const popularResult = await pool.query(
      'SELECT * FROM songs ORDER BY plays DESC LIMIT 20'
    );
    return popularResult.rows;
  }

  // Get genres and artists user likes
  const genres = historyResult.rows.map(row => row.genre).filter(Boolean);
  const artistIds = historyResult.rows.map(row => row.artist_id).filter(Boolean);

  // Find similar songs based on genres and artists
  let query = 'SELECT DISTINCT s.* FROM songs s WHERE ';
  const conditions = [];
  const params = [];
  let paramCount = 1;

  if (genres.length > 0) {
    conditions.push(`s.genre = ANY($${paramCount})`);
    params.push(genres);
    paramCount++;
  }

  if (artistIds.length > 0) {
    conditions.push(`s.artist_id = ANY($${paramCount})`);
    params.push(artistIds);
    paramCount++;
  }

  query += conditions.join(' OR ');
  query += ' ORDER BY s.plays DESC LIMIT 20';

  const result = await pool.query(query, params);
  return result.rows;
};

// Get personalized recommendations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const redis = getRedisClient();
    const cacheKey = `recommendations:${userId}`;

    // Try to get from cache
    if (redis && redis.isOpen) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ songs: JSON.parse(cached), cached: true });
      }
    }

    const recommendations = await getRecommendations(userId);

    // Cache recommendations for 1 hour
    if (redis && redis.isOpen) {
      await redis.setEx(cacheKey, 3600, JSON.stringify(recommendations));
    }

    res.json({ songs: recommendations, cached: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending songs
router.get('/trending', async (req, res) => {
  try {
    const redis = getRedisClient();
    const cacheKey = 'trending:songs';

    // Try to get from cache
    if (redis && redis.isOpen) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ songs: JSON.parse(cached), cached: true });
      }
    }

    // Get songs with most plays in last 7 days
    const result = await pool.query(
      `SELECT * FROM songs 
       WHERE created_at > NOW() - INTERVAL '7 days'
       ORDER BY plays DESC 
       LIMIT 20`
    );

    // Cache for 30 minutes
    if (redis && redis.isOpen) {
      await redis.setEx(cacheKey, 1800, JSON.stringify(result.rows));
    }

    res.json({ songs: result.rows, cached: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
