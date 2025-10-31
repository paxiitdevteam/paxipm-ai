// File routes for project file uploads
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import pool from '../../db/connection.js';
import authenticateToken from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads');
(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
})();

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const projectId = req.body.projectId || req.params.projectId;
    const projectDir = path.join(uploadsDir, `project-${projectId}`);
    try {
      await fs.mkdir(projectDir, { recursive: true });
      cb(null, projectDir);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types (you can restrict this if needed)
    cb(null, true);
  }
});

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management operations
 */

/**
 * @swagger
 * /api/files/project/{projectId}:
 *   get:
 *     summary: Get all files for a specific project
 *     tags: [Files]
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
 *         description: List of files for the project
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

    // Get files from database
    const [rows] = await pool.execute(
      'SELECT * FROM files WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/files:
 *   post:
 *     summary: Upload a file for a project
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - file
 *             properties:
 *               projectId:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request (missing projectId or file)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found or not accessible
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { projectId, description } = req.body;

    if (!projectId) {
      // Delete uploaded file if projectId is missing
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Verify project belongs to user
    const [projectRows] = await pool.execute(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (projectRows.length === 0) {
      // Delete uploaded file if project doesn't exist or doesn't belong to user
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    // Save file info to database
    const insertResult = await pool.query(
      'INSERT INTO files (project_id, filename, original_name, file_path, file_size, mime_type, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        projectId,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
        description || null
      ]
    );

    const insertId = insertResult.insertId;
    const [newFiles] = await pool.execute('SELECT * FROM files WHERE id = ?', [insertId]);

    res.status(201).json(newFiles[0]);
  } catch (error) {
    console.error('Error uploading file:', error);
    // Try to delete uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Download a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;

    // Get file info and verify project ownership
    const [rows] = await pool.execute(
      `SELECT f.* FROM files f
       INNER JOIN projects p ON f.project_id = p.id
       WHERE f.id = ? AND p.user_id = ?`,
      [fileId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = rows[0];
    const filePath = file.file_path;

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, file.original_name);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;

    // Get file info and verify project ownership
    const [rows] = await pool.execute(
      `SELECT f.* FROM files f
       INNER JOIN projects p ON f.project_id = p.id
       WHERE f.id = ? AND p.user_id = ?`,
      [fileId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = rows[0];
    const filePath = file.file_path;

    // Delete file from disk
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file from disk:', err);
      // Continue to delete from database even if file doesn't exist
    }

    // Delete file record from database
    await pool.execute('DELETE FROM files WHERE id = ?', [fileId]);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

