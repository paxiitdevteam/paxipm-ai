// Report routes
import express from 'express';
import pool from '../../db/connection.js';
import Report from '../models/Report.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         projectId:
 *           type: integer
 *           example: 1
 *         summary:
 *           type: string
 *           example: Project status report summary
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 */

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports for user's projects
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.* FROM reports r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE p.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    const reports = rows.map(row => Report.fromDb(row).toJSON());
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports/project/{projectId}:
 *   get:
 *     summary: Get reports for a specific project
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of project reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.* FROM reports r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.project_id = ? AND p.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.projectId, req.user.id]
    );
    const reports = rows.map(row => Report.fromDb(row).toJSON());
    res.json(reports);
  } catch (error) {
    console.error('Error fetching project reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
