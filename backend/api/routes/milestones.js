// Milestone routes
import express from 'express';
import pool from '../../db/connection.js';
import Milestone from '../models/Milestone.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Milestones
 *   description: Milestone management operations
 */

/**
 * @swagger
 * /api/milestones/project/{projectId}:
 *   get:
 *     summary: Get all milestones for a specific project
 *     tags: [Milestones]
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
 *         description: List of milestones for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Milestone'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found or not accessible
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Verify project belongs to user
    const [projectRows] = await pool.execute(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    // Get all milestones for the project
    const [rows] = await pool.execute(
      'SELECT * FROM milestones WHERE project_id = ? ORDER BY target_date ASC',
      [projectId]
    );

    const milestones = rows.map(row => Milestone.fromDb(row).toJSON());
    res.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/milestones:
 *   post:
 *     summary: Create a new milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - title
 *               - targetDate
 *             properties:
 *               projectId:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: Project Launch
 *               description:
 *                 type: string
 *                 example: Launch the project to production
 *               targetDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed, Missed]
 *                 default: Pending
 *     responses:
 *       201:
 *         description: Milestone created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Milestone'
 *       400:
 *         description: Bad request (missing required fields)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found or not accessible
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, title, description, targetDate, status } = req.body;

    if (!projectId || !title || !targetDate) {
      return res.status(400).json({ error: 'Project ID, title, and target date are required' });
    }

    // Verify project belongs to user
    const [projectRows] = await pool.execute(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    const insertResult = await pool.query(
      'INSERT INTO milestones (project_id, title, description, target_date, status) VALUES (?, ?, ?, ?, ?)',
      [
        projectId,
        title,
        description || null,
        targetDate,
        status || 'Pending'
      ]
    );

    const insertId = insertResult.insertId;

    // Fetch the inserted milestone
    const [newMilestones] = await pool.execute('SELECT * FROM milestones WHERE id = ?', [insertId]);
    const milestone = Milestone.fromDb(newMilestones[0]);
    res.status(201).json(milestone.toJSON());
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   get:
 *     summary: Get a specific milestone by ID
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Milestone ID
 *     responses:
 *       200:
 *         description: Milestone details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Milestone'
 *       404:
 *         description: Milestone not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const milestoneId = req.params.id;

    // Get milestone and verify project belongs to user
    const [rows] = await pool.execute(
      `SELECT m.* FROM milestones m
       INNER JOIN projects p ON m.project_id = p.id
       WHERE m.id = ? AND p.user_id = ?`,
      [milestoneId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    const milestone = Milestone.fromDb(rows[0]);
    res.json(milestone.toJSON());
  } catch (error) {
    console.error('Error fetching milestone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   patch:
 *     summary: Update a milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Milestone ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed, Missed]
 *               completedDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Milestone updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Milestone'
 *       404:
 *         description: Milestone not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const milestoneId = req.params.id;
    const { title, description, targetDate, status, completedDate } = req.body;

    // Verify milestone exists and project belongs to user
    const [existingRows] = await pool.execute(
      `SELECT m.* FROM milestones m
       INNER JOIN projects p ON m.project_id = p.id
       WHERE m.id = ? AND p.user_id = ?`,
      [milestoneId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Build dynamic UPDATE query
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (targetDate !== undefined) {
      updateFields.push('target_date = ?');
      updateValues.push(targetDate);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
      // Auto-set completed_date when status is Completed
      if (status === 'Completed' && !completedDate) {
        updateFields.push('completed_date = ?');
        updateValues.push(new Date().toISOString().split('T')[0]);
      } else if (status !== 'Completed') {
        updateFields.push('completed_date = ?');
        updateValues.push(null);
      }
    }
    if (completedDate !== undefined) {
      updateFields.push('completed_date = ?');
      updateValues.push(completedDate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(milestoneId);

    await pool.execute(
      `UPDATE milestones SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated milestone
    const [updatedRows] = await pool.execute(
      `SELECT m.* FROM milestones m
       INNER JOIN projects p ON m.project_id = p.id
       WHERE m.id = ? AND p.user_id = ?`,
      [milestoneId, req.user.id]
    );

    const milestone = Milestone.fromDb(updatedRows[0]);
    res.json(milestone.toJSON());
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   delete:
 *     summary: Delete a milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Milestone ID
 *     responses:
 *       200:
 *         description: Milestone deleted successfully
 *       404:
 *         description: Milestone not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const milestoneId = req.params.id;

    // Verify milestone exists and project belongs to user
    const [existingRows] = await pool.execute(
      `SELECT m.* FROM milestones m
       INNER JOIN projects p ON m.project_id = p.id
       WHERE m.id = ? AND p.user_id = ?`,
      [milestoneId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Delete milestone
    await pool.execute('DELETE FROM milestones WHERE id = ?', [milestoneId]);

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

