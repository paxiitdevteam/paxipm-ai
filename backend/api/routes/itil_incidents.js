// ITIL Incident routes (named itil_incidents to avoid conflict with existing issues route)
import express from 'express';
import pool from '../../db/connection.js';
import ITILIncident from '../models/ITILIncident.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ITIL Incidents
 *   description: ITIL Incident Management operations
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
      'SELECT * FROM incidents WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const incidents = rows.map(row => ITILIncident.fromDb(row).toJSON());
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, assetId, title, description, priority, status, reportedBy, assignedTo, slaId } = req.body;

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
      'INSERT INTO incidents (project_id, asset_id, title, description, priority, status, reported_by, assigned_to, sla_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        projectId,
        assetId || null,
        title,
        description || null,
        priority || 'Medium',
        status || 'Open',
        reportedBy || null,
        assignedTo || null,
        slaId || null
      ]
    );

    const insertId = insertResult.insertId;
    const [newIncidents] = await pool.execute('SELECT * FROM incidents WHERE id = ?', [insertId]);
    const incident = ITILIncident.fromDb(newIncidents[0]);
    res.status(201).json(incident.toJSON());
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const incidentId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT i.* FROM incidents i
       INNER JOIN projects p ON i.project_id = p.id
       WHERE i.id = ? AND p.user_id = ?`,
      [incidentId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const incident = ITILIncident.fromDb(rows[0]);
    res.json(incident.toJSON());
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const incidentId = req.params.id;
    const { title, description, priority, status, reportedBy, assignedTo, slaId, resolution } = req.body;

    const [existingRows] = await pool.execute(
      `SELECT i.* FROM incidents i
       INNER JOIN projects p ON i.project_id = p.id
       WHERE i.id = ? AND p.user_id = ?`,
      [incidentId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (priority !== undefined) { updateFields.push('priority = ?'); updateValues.push(priority); }
    if (status !== undefined) { 
      updateFields.push('status = ?'); 
      updateValues.push(status);
      // Auto-set resolved_at when status is Resolved
      if (status === 'Resolved' || status === 'Closed') {
        updateFields.push('resolved_at = ?');
        updateValues.push(new Date());
      } else {
        updateFields.push('resolved_at = ?');
        updateValues.push(null);
      }
    }
    if (reportedBy !== undefined) { updateFields.push('reported_by = ?'); updateValues.push(reportedBy); }
    if (assignedTo !== undefined) { updateFields.push('assigned_to = ?'); updateValues.push(assignedTo); }
    if (slaId !== undefined) { updateFields.push('sla_id = ?'); updateValues.push(slaId); }
    if (resolution !== undefined) { updateFields.push('resolution = ?'); updateValues.push(resolution); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(incidentId);
    await pool.execute(`UPDATE incidents SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updatedRows] = await pool.execute(
      `SELECT i.* FROM incidents i
       INNER JOIN projects p ON i.project_id = p.id
       WHERE i.id = ? AND p.user_id = ?`,
      [incidentId, req.user.id]
    );

    const incident = ITILIncident.fromDb(updatedRows[0]);
    res.json(incident.toJSON());
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const incidentId = req.params.id;

    const [existingRows] = await pool.execute(
      `SELECT i.* FROM incidents i
       INNER JOIN projects p ON i.project_id = p.id
       WHERE i.id = ? AND p.user_id = ?`,
      [incidentId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    await pool.execute('DELETE FROM incidents WHERE id = ?', [incidentId]);
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

