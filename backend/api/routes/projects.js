// Project routes
import express from 'express';
import pool from '../../db/connection.js';
import Project from '../models/Project.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Website Redesign
 *         description:
 *           type: string
 *           example: Complete website redesign project
 *         client:
 *           type: string
 *           example: Acme Corp
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2024-01-01
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2024-06-30
 *         status:
 *           type: string
 *           enum: [Active, Completed, On Hold, Cancelled]
 *           example: Active
 *         riskScore:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 45
 *         userId:
 *           type: integer
 *           example: 1
 *     CreateProjectRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: Website Redesign
 *         description:
 *           type: string
 *           example: Complete website redesign project
 *         client:
 *           type: string
 *           example: Acme Corp
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2024-01-01
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2024-06-30
 *         status:
 *           type: string
 *           enum: [Active, Completed, On Hold, Cancelled]
 *           example: Active
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects for authenticated user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const projects = rows.map(row => Project.fromDb(row).toJSON());
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request (missing title)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, client, startDate, endDate, status, budgetedAmount, spentAmount, currencyCode } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const insertResult = await pool.query(
      'INSERT INTO projects (title, description, client, start_date, end_date, status, budgeted_amount, spent_amount, currency_code, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        description || null,
        client || null,
        startDate || null,
        endDate || null,
        status || 'Active',
        budgetedAmount || 0,
        spentAmount || 0,
        currencyCode || 'USD',
        req.user.id
      ]
    );

    // Get insert ID (works for both mysql2 and SQLite)
    const insertId = insertResult.insertId;

    // Fetch the inserted project
    const [newProjects] = await pool.execute('SELECT * FROM projects WHERE id = ?', [insertId]);
    const project = Project.fromDb(newProjects[0]);
    res.status(201).json(project.toJSON());
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a specific project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = Project.fromDb(rows[0]);
    res.json(project.toJSON());
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
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
 *               client:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Active, Completed, On Hold, Cancelled]
 *               budgetedAmount:
 *                 type: number
 *               spentAmount:
 *                 type: number
 *               currencyCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, description, client, startDate, endDate, status, budgetedAmount, spentAmount, currencyCode, riskScore } = req.body;

    // Check if project exists and belongs to user
    const [existingRows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
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
    if (client !== undefined) {
      updateFields.push('client = ?');
      updateValues.push(client);
    }
    if (startDate !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(startDate);
    }
    if (endDate !== undefined) {
      updateFields.push('end_date = ?');
      updateValues.push(endDate);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (budgetedAmount !== undefined) {
      updateFields.push('budgeted_amount = ?');
      updateValues.push(budgetedAmount);
    }
    if (spentAmount !== undefined) {
      updateFields.push('spent_amount = ?');
      updateValues.push(spentAmount);
    }
    if (currencyCode !== undefined) {
      updateFields.push('currency_code = ?');
      updateValues.push(currencyCode);
    }
    if (riskScore !== undefined) {
      updateFields.push('risk_score = ?');
      updateValues.push(riskScore);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(projectId, req.user.id);

    await pool.execute(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    // Fetch updated project
    const [updatedRows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    const project = Project.fromDb(updatedRows[0]);
    res.json(project.toJSON());
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Check if project exists and belongs to user
    const [existingRows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete project (CASCADE will delete related tasks and reports)
    await pool.execute(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
