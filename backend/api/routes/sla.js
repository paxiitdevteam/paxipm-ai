// SLA (Service Level Agreement) routes
import express from 'express';
import pool from '../../db/connection.js';
import SLA from '../models/SLA.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SLA
 *   description: Service Level Agreement management operations
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
      'SELECT * FROM slas WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const slas = rows.map(row => SLA.fromDb(row).toJSON());
    res.json(slas);
  } catch (error) {
    console.error('Error fetching SLAs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, name, serviceDescription, targetUptime, responseTimeTarget, resolutionTimeTarget, penaltyClause, status, startDate, endDate } = req.body;

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
      'INSERT INTO slas (project_id, name, service_description, target_uptime, response_time_target, resolution_time_target, penalty_clause, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        projectId,
        name,
        serviceDescription || null,
        targetUptime || 99.90,
        responseTimeTarget || 60,
        resolutionTimeTarget || 240,
        penaltyClause || null,
        status || 'Active',
        startDate || null,
        endDate || null
      ]
    );

    const insertId = insertResult.insertId;
    const [newSLAs] = await pool.execute('SELECT * FROM slas WHERE id = ?', [insertId]);
    const sla = SLA.fromDb(newSLAs[0]);
    res.status(201).json(sla.toJSON());
  } catch (error) {
    console.error('Error creating SLA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const slaId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT s.* FROM slas s
       INNER JOIN projects p ON s.project_id = p.id
       WHERE s.id = ? AND p.user_id = ?`,
      [slaId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'SLA not found' });
    }

    const sla = SLA.fromDb(rows[0]);
    res.json(sla.toJSON());
  } catch (error) {
    console.error('Error fetching SLA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const slaId = req.params.id;
    const { name, serviceDescription, targetUptime, responseTimeTarget, resolutionTimeTarget, penaltyClause, aiRiskScore, status, startDate, endDate } = req.body;

    const [existingRows] = await pool.execute(
      `SELECT s.* FROM slas s
       INNER JOIN projects p ON s.project_id = p.id
       WHERE s.id = ? AND p.user_id = ?`,
      [slaId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'SLA not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (serviceDescription !== undefined) { updateFields.push('service_description = ?'); updateValues.push(serviceDescription); }
    if (targetUptime !== undefined) { updateFields.push('target_uptime = ?'); updateValues.push(targetUptime); }
    if (responseTimeTarget !== undefined) { updateFields.push('response_time_target = ?'); updateValues.push(responseTimeTarget); }
    if (resolutionTimeTarget !== undefined) { updateFields.push('resolution_time_target = ?'); updateValues.push(resolutionTimeTarget); }
    if (penaltyClause !== undefined) { updateFields.push('penalty_clause = ?'); updateValues.push(penaltyClause); }
    if (aiRiskScore !== undefined) { updateFields.push('ai_risk_score = ?'); updateValues.push(aiRiskScore); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (startDate !== undefined) { updateFields.push('start_date = ?'); updateValues.push(startDate); }
    if (endDate !== undefined) { updateFields.push('end_date = ?'); updateValues.push(endDate); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(slaId);
    await pool.execute(`UPDATE slas SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updatedRows] = await pool.execute(
      `SELECT s.* FROM slas s
       INNER JOIN projects p ON s.project_id = p.id
       WHERE s.id = ? AND p.user_id = ?`,
      [slaId, req.user.id]
    );

    const sla = SLA.fromDb(updatedRows[0]);
    res.json(sla.toJSON());
  } catch (error) {
    console.error('Error updating SLA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const slaId = req.params.id;

    const [existingRows] = await pool.execute(
      `SELECT s.* FROM slas s
       INNER JOIN projects p ON s.project_id = p.id
       WHERE s.id = ? AND p.user_id = ?`,
      [slaId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'SLA not found' });
    }

    await pool.execute('DELETE FROM slas WHERE id = ?', [slaId]);
    res.json({ message: 'SLA deleted successfully' });
  } catch (error) {
    console.error('Error deleting SLA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

