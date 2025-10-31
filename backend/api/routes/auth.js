// Authentication routes
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../db/connection.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: SecurePassword123!
 *         role:
 *           type: string
 *           enum: [Admin, Project Manager, Viewer]
 *           example: Project Manager
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: SecurePassword123!
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request (missing fields or user exists)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user - use query() for INSERT to get insertId
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, role || 'Viewer', passwordHash]
    );

    // Get insert ID (works for both mysql2 and SQLite)
    const insertId = insertResult.insertId;

    // Fetch the inserted user
    const [newUsers] = await pool.execute('SELECT * FROM users WHERE id = ?', [insertId]);
    const user = User.fromDb(newUsers[0]);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toPublic()
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Provide more specific error messages for debugging
    if (error.message && (error.message.includes('connect') || error.message.includes('ECONNREFUSED'))) {
      res.status(500).json({ error: 'Database connection failed. Please check your database configuration in .env file.' });
    } else if (error.message && error.message.includes('JWT')) {
      res.status(500).json({ error: 'JWT configuration error. Please set JWT_SECRET in .env file.' });
    } else if (error.message && error.message.includes('auth')) {
      res.status(500).json({ error: 'Database authentication error. Please check your MariaDB username and password in .env file.' });
    } else {
      res.status(500).json({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = User.fromDb(users[0]);

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toPublic()
    });
  } catch (error) {
    console.error('Login error:', error);
    // Provide more specific error messages for debugging
    if (error.message && (error.message.includes('connect') || error.message.includes('ECONNREFUSED'))) {
      res.status(500).json({ error: 'Database connection failed. Please check your database configuration in .env file.' });
    } else if (error.message && error.message.includes('JWT')) {
      res.status(500).json({ error: 'JWT configuration error. Please set JWT_SECRET in .env file.' });
    } else if (error.message && error.message.includes('auth')) {
      res.status(500).json({ error: 'Database authentication error. Please check your MariaDB username and password in .env file.' });
    } else {
      res.status(500).json({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

export default router;
