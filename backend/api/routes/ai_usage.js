// AI Usage Logs routes - Phase 3
import express from 'express';
import authenticateToken from '../middleware/auth.js';
import pool from '../../db/connection.js';

const router = express.Router();

// Get AI usage statistics for user
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [userId];

    if (startDate && endDate) {
      dateFilter = 'AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get total usage count
    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as count FROM ai_usage_logs WHERE user_id = ? ${dateFilter}`,
      params
    );

    // Get usage by endpoint
    const [byEndpoint] = await pool.execute(
      `SELECT endpoint, COUNT(*) as count, SUM(tokens_used) as total_tokens, 
       SUM(duration_ms) as total_duration, SUM(cost_estimate) as total_cost
       FROM ai_usage_logs 
       WHERE user_id = ? ${dateFilter}
       GROUP BY endpoint
       ORDER BY count DESC`,
      params
    );

    // Get usage by project
    const [byProject] = await pool.execute(
      `SELECT project_id, COUNT(*) as count 
       FROM ai_usage_logs 
       WHERE user_id = ? AND project_id IS NOT NULL ${dateFilter}
       GROUP BY project_id
       ORDER BY count DESC
       LIMIT 10`,
      params
    );

    // Get daily usage trend
    const [dailyTrend] = await pool.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count, 
       SUM(tokens_used) as total_tokens, SUM(cost_estimate) as total_cost
       FROM ai_usage_logs 
       WHERE user_id = ? ${dateFilter}
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    // Get total tokens and cost
    const [totals] = await pool.execute(
      `SELECT 
       SUM(tokens_used) as total_tokens,
       SUM(cost_estimate) as total_cost,
       AVG(duration_ms) as avg_duration
       FROM ai_usage_logs 
       WHERE user_id = ? ${dateFilter}`,
      params
    );

    res.json({
      summary: {
        total_requests: totalCount[0]?.count || 0,
        total_tokens: totals[0]?.total_tokens || 0,
        total_cost: totals[0]?.total_cost || 0,
        avg_duration_ms: totals[0]?.avg_duration || 0
      },
      by_endpoint: byEndpoint,
      by_project: byProject,
      daily_trend: dailyTrend
    });
  } catch (error) {
    console.error('Get AI usage stats error:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

// Get AI usage logs (with pagination)
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, endpoint, projectId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let filters = 'WHERE user_id = ?';
    const params = [userId];

    if (endpoint) {
      filters += ' AND endpoint = ?';
      params.push(endpoint);
    }

    if (projectId) {
      filters += ' AND project_id = ?';
      params.push(projectId);
    }

    const [logs] = await pool.execute(
      `SELECT * FROM ai_usage_logs ${filters} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as count FROM ai_usage_logs ${filters}`,
      params
    );

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get AI usage logs error:', error);
    res.status(500).json({ error: 'Failed to fetch usage logs' });
  }
});

export default router;

