// Project routes
import express from 'express';
import pool from '../../db/connection.js';
import Project from '../models/Project.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Get all projects (with auth)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    const projects = result.rows.map(row => Project.fromDb(row).toJSON());
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, client, startDate, endDate, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO projects (title, description, client, start_date, end_date, status, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description || null, client || null, startDate || null, endDate || null, status || 'Active', req.user.id]
    );

    const project = Project.fromDb(result.rows[0]);
    res.status(201).json(project.toJSON());
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = Project.fromDb(result.rows[0]);
    res.json(project.toJSON());
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

