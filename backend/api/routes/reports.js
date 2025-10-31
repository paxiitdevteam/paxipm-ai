// Report routes
import express from 'express';
import pool from '../../db/connection.js';
import Report from '../models/Report.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Get all reports for user's projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.* FROM reports r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE p.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    const reports = result.rows.map(row => Report.fromDb(row).toJSON());
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reports for specific project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.* FROM reports r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.project_id = $1 AND p.user_id = $2
       ORDER BY r.created_at DESC`,
      [req.params.projectId, req.user.id]
    );
    const reports = result.rows.map(row => Report.fromDb(row).toJSON());
    res.json(reports);
  } catch (error) {
    console.error('Error fetching project reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

