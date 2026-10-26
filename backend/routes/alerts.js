const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect } = require('../middleware/auth');

// GET /api/alerts — List alerts for current user
router.get('/', protect, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*,
              CASE WHEN ar.id IS NOT NULL THEN true ELSE false END AS is_read
       FROM alerts a
       LEFT JOIN alert_reads ar ON ar.alert_id = a.id AND ar.user_id = $1
       WHERE a.target_role = 'all' OR a.target_role = $2
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [req.user.id, req.user.role]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/alerts/unread-count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(*) FROM alerts a
       LEFT JOIN alert_reads ar ON ar.alert_id = a.id AND ar.user_id = $1
       WHERE (a.target_role = 'all' OR a.target_role = $2)
         AND ar.id IS NULL`,
      [req.user.id, req.user.role]
    );

    res.status(200).json({
      success: true,
      data: { unreadCount: parseInt(result.rows[0].count) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/alerts/:id/read — Mark alert as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await db.query(
      `INSERT INTO alert_reads (alert_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (alert_id, user_id) DO NOTHING`,
      [req.params.id, req.user.id]
    );

    res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;