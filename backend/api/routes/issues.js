// Issue routes
import express from 'express';
import pool from '../../db/connection.js';
import Issue from '../models/Issue.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Issues
 *   description: Issue management operations
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
      'SELECT * FROM issues WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const issues = rows.map(row => Issue.fromDb(row).toJSON());
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, title, description, severity, resolution, owner } = req.body;

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
      'INSERT INTO issues (project_id, title, description, severity, resolution, owner) VALUES (?, ?, ?, ?, ?, ?)',
      [
        projectId,
        title,
        description || null,
        severity || null,
        resolution || null,
        owner || null
      ]
    );

    const insertId = insertResult.insertId;
    const [newIssues] = await pool.execute('SELECT * FROM issues WHERE id = ?', [insertId]);
    const issue = Issue.fromDb(newIssues[0]);
    res.status(201).json(issue.toJSON());
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const issueId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT i.* FROM issues i
       INNER JOIN projects p ON i.project_id = p.id
       WHERE i.id = ? AND p.user_id = ?`,
      [issueId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = Issue.fromDb(rows[0]);
    res.json(issue.toJSON());
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const issueId = req.params.id;
    const { title, description, severity, status, resolution, owner } = req.body;

    const [existingRows] = await pool.execute(
      `SELECT i.* FROM issues i
       INNER JOIN projects p ON i.project_id = p.id
       WHERE i.id = ? AND p.user_id = ?`,
      [issueId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (severity !== undefined) { updateFields.push('severity = ?'); updateValues.push(severity); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (resolution !== undefined) { updateFields.push('resolution = ?'); updateValues.push(resolution); }
    if (owner !== undefined) { updateFields.push('owner = ?'); updateValues.push(owner); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(issueId);
    await pool.execute(`UPDATE issues SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updatedRows] = await pool.execute(
      `SELECT i.* FROM issues i
       INNER JOIN projects p ON i.project_id = p.id
       WHERE i.id = ? AND p.user_id = ?`,
      [issueId, req.user.id]
    );

    const issue = Issue.fromDb(updatedRows[0]);
    res.json(issue.toJSON());
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const issueId = req.params.id;

    const [existingRows] = await pool.execute(
      `SELECT i.* FROM issues i
       INNER JOIN projects p ON i.project_id = p.id
       WHERE i.id = ? AND p.user_id = ?`,
      [issueId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    await pool.execute('DELETE FROM issues WHERE id = ?', [issueId]);
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

