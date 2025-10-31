// Risk routes
import express from 'express';
import pool from '../../db/connection.js';
import Risk from '../models/Risk.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Risks
 *   description: Risk management operations
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
      'SELECT * FROM risks WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const risks = rows.map(row => Risk.fromDb(row).toJSON());
    res.json(risks);
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, title, description, probability, impact, riskScore, mitigationPlan, owner } = req.body;

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
      'INSERT INTO risks (project_id, title, description, probability, impact, risk_score, mitigation_plan, owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        projectId,
        title,
        description || null,
        probability || null,
        impact || null,
        riskScore || null,
        mitigationPlan || null,
        owner || null
      ]
    );

    const insertId = insertResult.insertId;
    const [newRisks] = await pool.execute('SELECT * FROM risks WHERE id = ?', [insertId]);
    const risk = Risk.fromDb(newRisks[0]);
    res.status(201).json(risk.toJSON());
  } catch (error) {
    console.error('Error creating risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const riskId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT r.* FROM risks r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.id = ? AND p.user_id = ?`,
      [riskId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    const risk = Risk.fromDb(rows[0]);
    res.json(risk.toJSON());
  } catch (error) {
    console.error('Error fetching risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const riskId = req.params.id;
    const { title, description, probability, impact, riskScore, status, mitigationPlan, owner } = req.body;

    const [existingRows] = await pool.execute(
      `SELECT r.* FROM risks r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.id = ? AND p.user_id = ?`,
      [riskId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (probability !== undefined) { updateFields.push('probability = ?'); updateValues.push(probability); }
    if (impact !== undefined) { updateFields.push('impact = ?'); updateValues.push(impact); }
    if (riskScore !== undefined) { updateFields.push('risk_score = ?'); updateValues.push(riskScore); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (mitigationPlan !== undefined) { updateFields.push('mitigation_plan = ?'); updateValues.push(mitigationPlan); }
    if (owner !== undefined) { updateFields.push('owner = ?'); updateValues.push(owner); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(riskId);
    await pool.execute(`UPDATE risks SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updatedRows] = await pool.execute(
      `SELECT r.* FROM risks r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.id = ? AND p.user_id = ?`,
      [riskId, req.user.id]
    );

    const risk = Risk.fromDb(updatedRows[0]);
    res.json(risk.toJSON());
  } catch (error) {
    console.error('Error updating risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const riskId = req.params.id;

    const [existingRows] = await pool.execute(
      `SELECT r.* FROM risks r
       INNER JOIN projects p ON r.project_id = p.id
       WHERE r.id = ? AND p.user_id = ?`,
      [riskId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    await pool.execute('DELETE FROM risks WHERE id = ?', [riskId]);
    res.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    console.error('Error deleting risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

