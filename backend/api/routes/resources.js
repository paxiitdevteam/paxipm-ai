// Resource routes
import express from 'express';
import pool from '../../db/connection.js';
import Resource from '../models/Resource.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource management operations
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

    const [rows] = await pool.execute(
      'SELECT * FROM resources WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const resources = rows.map(row => Resource.fromDb(row).toJSON());
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, name, role, email, allocationPercentage, startDate, endDate, hourlyRate } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ error: 'Project ID and name are required' });
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
      'INSERT INTO resources (project_id, name, role, email, allocation_percentage, start_date, end_date, hourly_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        projectId,
        name,
        role || null,
        email || null,
        allocationPercentage || 100,
        startDate || null,
        endDate || null,
        hourlyRate || null
      ]
    );

    const insertId = insertResult.insertId;
    const [newResources] = await pool.execute('SELECT * FROM resources WHERE id = ?', [insertId]);
    const resource = Resource.fromDb(newResources[0]);
    res.status(201).json(resource.toJSON());
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resourceId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT r.* FROM resources r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.id = ? AND p.user_id = ?`,
      [resourceId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const resource = Resource.fromDb(rows[0]);
    res.json(resource.toJSON());
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const { name, role, email, allocationPercentage, startDate, endDate, hourlyRate } = req.body;

    const [existingRows] = await pool.execute(
      `SELECT r.* FROM resources r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.id = ? AND p.user_id = ?`,
      [resourceId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (role !== undefined) { updateFields.push('role = ?'); updateValues.push(role); }
    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
    if (allocationPercentage !== undefined) { updateFields.push('allocation_percentage = ?'); updateValues.push(allocationPercentage); }
    if (startDate !== undefined) { updateFields.push('start_date = ?'); updateValues.push(startDate); }
    if (endDate !== undefined) { updateFields.push('end_date = ?'); updateValues.push(endDate); }
    if (hourlyRate !== undefined) { updateFields.push('hourly_rate = ?'); updateValues.push(hourlyRate); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(resourceId);
    await pool.execute(`UPDATE resources SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updatedRows] = await pool.execute(
      `SELECT r.* FROM resources r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.id = ? AND p.user_id = ?`,
      [resourceId, req.user.id]
    );

    const resource = Resource.fromDb(updatedRows[0]);
    res.json(resource.toJSON());
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resourceId = req.params.id;

    const [existingRows] = await pool.execute(
      `SELECT r.* FROM resources r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.id = ? AND p.user_id = ?`,
      [resourceId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await pool.execute('DELETE FROM resources WHERE id = ?', [resourceId]);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

