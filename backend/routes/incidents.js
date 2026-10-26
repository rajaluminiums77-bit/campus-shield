const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Priority mapping based on incident type
const priorityMap = {
  Fire: 'Critical',
  'Medical Emergency': 'Critical',
  Theft: 'High',
  Harassment: 'High',
  Ragging: 'High',
  Bullying: 'Medium',
  'Suspicious Person': 'Medium',
  'Lost Item': 'Low',
  Other: 'Low',
};

// POST /api/incidents — Create incident
router.post('/', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, type, location, description, lat, lng } = req.body;

    if (!title || !type || !location || !description) {
      return res.status(400).json({ success: false, message: 'All fields required.' });
    }

    const priority = priorityMap[type] || 'Medium';

    const result = await db.query(
      `INSERT INTO incidents (title, type, location, description, priority, status, reported_by, reporter_name, lat, lng)
       VALUES ($1, $2, $3, $4, $5, 'Active', $6, $7, $8, $9)
       RETURNING *`,
      [title, type, location, description, priority, req.user.id, req.user.name, lat || null, lng || null]
    );

    const incident = result.rows[0];

    // Save attachments if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          `INSERT INTO incident_attachments (incident_id, filename, path, mimetype, size)
           VALUES ($1, $2, $3, $4, $5)`,
          [incident.id, file.filename, file.path, file.mimetype, file.size]
        );
      }
    }

    // Create alert for security
    await db.query(
      `INSERT INTO alerts (title, message, type, severity, incident_id, target_role)
       VALUES ($1, $2, 'Incident', $3, $4, 'security')`,
      [`New ${type} Incident`, `${title} at ${location}`, priority, incident.id]
    );

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully.',
      data: incident,
    });
  } catch (err) {
    console.error('Create incident error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/incidents — List incidents
router.get('/', protect, async (req, res) => {
  try {
    let query, params = [];

    if (req.user.role === 'student') {
      query = `SELECT i.*, u.name AS reporter_full_name
               FROM incidents i
               LEFT JOIN users u ON i.reported_by = u.id
               WHERE i.reported_by = $1
               ORDER BY i.created_at DESC LIMIT 50`;
      params = [req.user.id];
    } else {
      query = `SELECT i.*, u.name AS reporter_full_name
               FROM incidents i
               LEFT JOIN users u ON i.reported_by = u.id
               ORDER BY i.created_at DESC LIMIT 100`;
    }

    const result = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/incidents/stats — Dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await db.query('SELECT COUNT(*) FROM incidents');
    const active = await db.query("SELECT COUNT(*) FROM incidents WHERE status = 'Active'");
    const inProgress = await db.query("SELECT COUNT(*) FROM incidents WHERE status = 'In Progress'");
    const resolved = await db.query("SELECT COUNT(*) FROM incidents WHERE status = 'Resolved'");

    const avgResult = await db.query(
      'SELECT AVG(response_time) AS avg_time FROM incidents WHERE response_time IS NOT NULL'
    );

    const byType = await db.query(
      'SELECT type, COUNT(*) AS count FROM incidents GROUP BY type ORDER BY count DESC'
    );

    const byPriority = await db.query(
      'SELECT priority, COUNT(*) AS count FROM incidents GROUP BY priority'
    );

    const trend = await db.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM incidents
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.status(200).json({
      success: true,
      data: {
        totalIncidents: parseInt(total.rows[0].count),
        activeIncidents: parseInt(active.rows[0].count),
        inProgress: parseInt(inProgress.rows[0].count),
        resolved: parseInt(resolved.rows[0].count),
        avgResponseTime: Math.round((parseFloat(avgResult.rows[0].avg_time) || 0) * 10) / 10,
        byType: byType.rows,
        byPriority: byPriority.rows,
        dailyTrend: trend.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/incidents/sos — Trigger SOS
router.post('/sos', protect, async (req, res) => {
  try {
    const { location, lat, lng } = req.body;

    const result = await db.query(
      `INSERT INTO incidents (title, type, location, description, priority, status, reported_by, reporter_name, lat, lng)
       VALUES ($1, 'Medical Emergency', $2, $3, 'Critical', 'Active', $4, $5, $6, $7)
       RETURNING *`,
      [
        '🚨 SOS EMERGENCY',
        location || 'Location auto-captured',
        `SOS triggered by ${req.user.name}. Immediate assistance required.`,
        req.user.id,
        req.user.name,
        lat || null,
        lng || null,
      ]
    );

    await db.query(
      `INSERT INTO alerts (title, message, type, severity, incident_id, target_role)
       VALUES ($1, $2, 'SOS', 'Critical', $3, 'security')`,
      [
        '🚨 SOS EMERGENCY ALERT',
        `${req.user.name} triggered SOS at ${location || 'campus'}`,
        result.rows[0].id,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'SOS activated. Security notified.',
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/incidents/:id/status — Update status (security/admin only)
router.put('/:id/status', protect, authorize('security', 'admin'), async (req, res) => {
  try {
    const { status, message } = req.body;

    const existing = await db.query('SELECT * FROM incidents WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    const incident = existing.rows[0];
    let responseTime = incident.response_time;
    let resolvedAt = incident.resolved_at;

    if (status === 'Resolved' || status === 'Closed') {
      resolvedAt = new Date();
      responseTime = Math.round((resolvedAt - new Date(incident.created_at)) / 60000);
    }

    await db.query(
      `UPDATE incidents SET status = $1, assigned_to = $2, response_time = $3, resolved_at = $4, updated_at = NOW()
       WHERE id = $5`,
      [status, req.user.id, responseTime, resolvedAt, req.params.id]
    );

    await db.query(
      `INSERT INTO incident_updates (incident_id, message, status, updated_by)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, message || `Status changed to ${status}`, status, req.user.id]
    );

    const updated = await db.query('SELECT * FROM incidents WHERE id = $1', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Status updated.',
      data: updated.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;