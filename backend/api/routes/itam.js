// ITAM (IT Asset Management) routes
import express from 'express';
import pool from '../../db/connection.js';
import Asset from '../models/Asset.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ITAM
 *   description: IT Asset Management operations
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
      'SELECT * FROM assets WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const assets = rows.map(row => Asset.fromDb(row).toJSON());
    res.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, name, type, owner, status, location, serialNumber, purchaseDate, warrantyExpiry, cost } = req.body;

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
      'INSERT INTO assets (project_id, name, type, owner, status, location, serial_number, purchase_date, warranty_expiry, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        projectId,
        name,
        type || 'Other',
        owner || null,
        status || 'Active',
        location || null,
        serialNumber || null,
        purchaseDate || null,
        warrantyExpiry || null,
        cost || null
      ]
    );

    const insertId = insertResult.insertId;
    const [newAssets] = await pool.execute('SELECT * FROM assets WHERE id = ?', [insertId]);
    const asset = Asset.fromDb(newAssets[0]);
    res.status(201).json(asset.toJSON());
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assetId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT a.* FROM assets a
       INNER JOIN projects p ON a.project_id = p.id
       WHERE a.id = ? AND p.user_id = ?`,
      [assetId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = Asset.fromDb(rows[0]);
    res.json(asset.toJSON());
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const assetId = req.params.id;
    const { name, type, owner, status, location, serialNumber, purchaseDate, warrantyExpiry, cost } = req.body;

    const [existingRows] = await pool.execute(
      `SELECT a.* FROM assets a
       INNER JOIN projects p ON a.project_id = p.id
       WHERE a.id = ? AND p.user_id = ?`,
      [assetId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (type !== undefined) { updateFields.push('type = ?'); updateValues.push(type); }
    if (owner !== undefined) { updateFields.push('owner = ?'); updateValues.push(owner); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (location !== undefined) { updateFields.push('location = ?'); updateValues.push(location); }
    if (serialNumber !== undefined) { updateFields.push('serial_number = ?'); updateValues.push(serialNumber); }
    if (purchaseDate !== undefined) { updateFields.push('purchase_date = ?'); updateValues.push(purchaseDate); }
    if (warrantyExpiry !== undefined) { updateFields.push('warranty_expiry = ?'); updateValues.push(warrantyExpiry); }
    if (cost !== undefined) { updateFields.push('cost = ?'); updateValues.push(cost); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(assetId);
    await pool.execute(`UPDATE assets SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updatedRows] = await pool.execute(
      `SELECT a.* FROM assets a
       INNER JOIN projects p ON a.project_id = p.id
       WHERE a.id = ? AND p.user_id = ?`,
      [assetId, req.user.id]
    );

    const asset = Asset.fromDb(updatedRows[0]);
    res.json(asset.toJSON());
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const assetId = req.params.id;

    const [existingRows] = await pool.execute(
      `SELECT a.* FROM assets a
       INNER JOIN projects p ON a.project_id = p.id
       WHERE a.id = ? AND p.user_id = ?`,
      [assetId, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await pool.execute('DELETE FROM assets WHERE id = ?', [assetId]);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

