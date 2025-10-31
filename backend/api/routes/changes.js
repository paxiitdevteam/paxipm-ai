// Change Management routes
import express from 'express';
import pool from '../../db/connection.js';
import Change from '../models/Change.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Changes
 *   description: Change Management operations
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
      'SELECT * FROM changes WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const changes = rows.map(row => Change.fromDb(row).toJSON());
    res.json(changes);
  } catch (error) {
    console.error('Error fetching changes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, title, description, changeType, status, requestedBy, rollbackPlan, riskAssessment } = req.body;

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
      'INSERT INTO changes (project_id, title, description, change_type, status, requested_by, rollback_plan, risk_assessment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        projectId,
        title,
        description || null,
        changeType || 'Normal',
        status || 'Requested',
        requestedBy || null,
        rollbackPlan || null,
        riskAssessment || null
      ]
    );

    const insertId = insertResult.insertId;
    const [newChanges] = await pool.execute('SELECT * FROM changes WHERE id = ?', [insertId]);
    const change = Change.fromDb(newChanges[0]);
    res.status(201).json(change.toJSON());
  } catch (error) {
    console.error('Error creating change:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const changeId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT c.* FROM changes c
       INNER JOIN projects p ON c.project_id = p.id
       WHERE c.id = ? AND p.user_id = ?`,
      [changeId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Change not found' });
    }

    const change = Change.fromDb(rows[0]);
    res.json(change.toJSON());
  } catch (error) {
    console.error('Error fetching change:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const changeId = req.params.id;
    const { title, description, changeType, status, requestedBy, approvedBy, implementedBy, implementationDate, rollbackPlan, riskAssessment } = req.body;

    const [existingRows] = await pool.execute(
      `SELECT c.* FROM changes c
       INNER JOIN projects p ON c.project_id = p.id
       WHERE c.id = ? AND p.user_id = ?`,
      [changeId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Change not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (changeType !== undefined) { updateFields.push('change_type = ?'); updateValues.push(changeType); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (requestedBy !== undefined) { updateFields.push('requested_by = ?'); updateValues.push(requestedBy); }
    if (approvedBy !== undefined) { updateFields.push('approved_by = ?'); updateValues.push(approvedBy); }
    if (implementedBy !== undefined) { updateFields.push('implemented_by = ?'); updateValues.push(implementedBy); }
    if (implementationDate !== undefined) { updateFields.push('implementation_date = ?'); updateValues.push(implementationDate); }
    if (rollbackPlan !== undefined) { updateFields.push('rollback_plan = ?'); updateValues.push(rollbackPlan); }
    if (riskAssessment !== undefined) { updateFields.push('risk_assessment = ?'); updateValues.push(riskAssessment); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(changeId);
    await pool.execute(`UPDATE changes SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updatedRows] = await pool.execute(
      `SELECT c.* FROM changes c
       INNER JOIN projects p ON c.project_id = p.id
       WHERE c.id = ? AND p.user_id = ?`,
      [changeId, req.user.id]
    );

    const change = Change.fromDb(updatedRows[0]);
    res.json(change.toJSON());
  } catch (error) {
    console.error('Error updating change:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const changeId = req.params.id;

    const [existingRows] = await pool.execute(
      `SELECT c.* FROM changes c
       INNER JOIN projects p ON c.project_id = p.id
       WHERE c.id = ? AND p.user_id = ?`,
      [changeId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Change not found' });
    }

    await pool.execute('DELETE FROM changes WHERE id = ?', [changeId]);
    res.json({ message: 'Change deleted successfully' });
  } catch (error) {
    console.error('Error deleting change:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

