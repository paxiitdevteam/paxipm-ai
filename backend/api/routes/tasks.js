// Task routes
import express from 'express';
import pool from '../../db/connection.js';
import Task from '../models/Task.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management operations
 */

/**
 * @swagger
 * /api/tasks/project/{projectId}:
 *   get:
 *     summary: Get all tasks for a specific project
 *     tags: [Tasks]
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
 *         description: List of tasks for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
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

    // Get all tasks for the project
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const tasks = rows.map(row => Task.fromDb(row).toJSON());
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
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
 *             properties:
 *               projectId:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: Complete database migration
 *               owner:
 *                 type: string
 *                 example: John Doe
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 0
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
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
    const { projectId, title, owner, progress, dueDate } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project ID and title are required' });
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
      'INSERT INTO tasks (project_id, title, owner, progress, due_date) VALUES (?, ?, ?, ?, ?)',
      [
        projectId,
        title,
        owner || null,
        progress || 0,
        dueDate || null
      ]
    );

    const insertId = insertResult.insertId;

    // Fetch the inserted task
    const [newTasks] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [insertId]);
    const task = Task.fromDb(newTasks[0]);
    res.status(201).json(task.toJSON());
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;

    // Get task and verify project belongs to user
    const [rows] = await pool.execute(
      `SELECT t.* FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [taskId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = Task.fromDb(rows[0]);
    res.json(task.toJSON());
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               owner:
 *                 type: string
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, owner, progress, dueDate } = req.body;

    // Verify task exists and project belongs to user
    const [existingRows] = await pool.execute(
      `SELECT t.* FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [taskId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Build dynamic UPDATE query
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (owner !== undefined) {
      updateFields.push('owner = ?');
      updateValues.push(owner);
    }
    if (progress !== undefined) {
      updateFields.push('progress = ?');
      updateValues.push(progress);
    }
    if (dueDate !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(dueDate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(taskId);

    await pool.execute(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated task
    const [updatedRows] = await pool.execute(
      `SELECT t.* FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [taskId, req.user.id]
    );

    const task = Task.fromDb(updatedRows[0]);
    res.json(task.toJSON());
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;

    // Verify task exists and project belongs to user
    const [existingRows] = await pool.execute(
      `SELECT t.* FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [taskId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete task
    await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

