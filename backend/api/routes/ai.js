// AI routes - connects to AI Engine FastAPI service
import express from 'express';
import axios from 'axios';
import authenticateToken from '../middleware/auth.js';
import pool from '../../db/connection.js';

const router = express.Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Generate project charter
router.post('/charter', authenticateToken, async (req, res) => {
  try {
    const { projectName, description, client } = req.body;

    if (!projectName || !description) {
      return res.status(400).json({ error: 'Project name and description are required' });
    }

    // Send request to AI Engine with auth token
    const response = await axios.post(
      `${AI_ENGINE_URL}/generate-charter`,
      {
        projectName,
        description,
        client: client || null
      },
      {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('AI Charter generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate charter', 
      details: error.response?.data?.detail || error.message 
    });
  }
});

// Generate risk score
router.post('/risk', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Send request to AI Engine with auth token
    const response = await axios.post(
      `${AI_ENGINE_URL}/calculate-risk`,
      { project_id: projectId },
      {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
        }
      }
    );

    // Optionally save risk score to database
    if (response.data.risk_score !== undefined) {
      await pool.query(
        'UPDATE projects SET risk_score = $1 WHERE id = $2',
        [response.data.risk_score, projectId]
      );
    }

    res.json(response.data);
  } catch (error) {
    console.error('AI Risk calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate risk score', 
      details: error.response?.data?.detail || error.message 
    });
  }
});

// Project setup endpoint (Model Flow example)
router.post('/project-setup', authenticateToken, async (req, res) => {
  try {
    const { project, progress } = req.body;

    if (!project || progress === undefined) {
      return res.status(400).json({ 
        error: 'Project name and progress are required' 
      });
    }

    // Step 1: Backend sends JSON to AI Engine
    const response = await axios.post(
      `${AI_ENGINE_URL}/project-setup`,
      { project, progress },
      {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
        }
      }
    );

    // Step 5: Save validated response to database if project ID provided
    if (req.body.projectId && response.data.status === 'success') {
      const setupData = response.data.data;
      
      // Save project setup data
      await pool.query(
        'INSERT INTO reports (project_id, summary) VALUES ($1, $2)',
        [req.body.projectId, JSON.stringify(setupData)]
      );
    }

    res.json(response.data);
  } catch (error) {
    console.error('AI Project setup error:', error);
    res.status(500).json({ 
      error: 'Failed to generate project setup', 
      details: error.response?.data?.detail || error.message 
    });
  }
});

// Risk Analysis endpoint (Charter + WBS + Risks)
router.post('/risk-analysis', authenticateToken, async (req, res) => {
  try {
    const { projectDescription, duration, teamSize } = req.body;

    if (!projectDescription || !duration || !teamSize) {
      return res.status(400).json({ 
        error: 'Project description, duration, and team size are required' 
      });
    }

    // Send request to AI Engine with auth token
    const response = await axios.post(
      `${AI_ENGINE_URL}/risk-analysis`,
      {
        project_description: projectDescription,
        duration,
        team_size: teamSize
      },
      {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
        }
      }
    );

    // Save to database if project ID provided
    if (req.body.projectId && response.data.status === 'success') {
      const analysisData = response.data.data;
      
      // Save as report
      await pool.query(
        'INSERT INTO reports (project_id, summary) VALUES ($1, $2)',
        [req.body.projectId, JSON.stringify(analysisData)]
      );
      
      // Update project with charter info if needed
      if (analysisData.project_charter) {
        await pool.query(
          'UPDATE projects SET description = $1 WHERE id = $2',
          [analysisData.project_charter.executive_summary, req.body.projectId]
        );
      }
    }

    res.json(response.data);
  } catch (error) {
    console.error('AI Risk analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk analysis', 
      details: error.response?.data?.detail || error.message 
    });
  }
});

// Reporting endpoint (Progress analysis + Risk rating)
router.post('/reporting', authenticateToken, async (req, res) => {
  try {
    const { progressData } = req.body;

    if (!progressData) {
      return res.status(400).json({ 
        error: 'Progress data is required' 
      });
    }

    // Send request to AI Engine with auth token
    const response = await axios.post(
      `${AI_ENGINE_URL}/reporting`,
      {
        progress_data: progressData
      },
      {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
        }
      }
    );

    // Save to database if project ID provided
    if (req.body.projectId && response.data.status === 'success') {
      const reportData = response.data.data;
      
      // Save report
      await pool.query(
        'INSERT INTO reports (project_id, summary) VALUES ($1, $2)',
        [req.body.projectId, JSON.stringify(reportData)]
      );
      
      // Update project risk score if available
      if (reportData.risk_score !== undefined) {
        await pool.query(
          'UPDATE projects SET risk_score = $1 WHERE id = $2',
          [reportData.risk_score, req.body.projectId]
        );
      }
    }

    res.json(response.data);
  } catch (error) {
    console.error('AI Reporting error:', error);
    res.status(500).json({ 
      error: 'Failed to generate report', 
      details: error.response?.data?.detail || error.message 
    });
  }
});

// PMO Report endpoint (Professional status report)
router.post('/pmo-report', authenticateToken, async (req, res) => {
  try {
    const { projectData } = req.body;

    if (!projectData) {
      return res.status(400).json({ 
        error: 'Project data is required' 
      });
    }

    // Send request to AI Engine with auth token
    const response = await axios.post(
      `${AI_ENGINE_URL}/pmo-report`,
      {
        project_data: projectData
      },
      {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
        }
      }
    );

    // Save to database if project ID provided
    if (req.body.projectId && response.data.status === 'success') {
      const reportData = response.data.data;
      
      // Save plain text report and JSON summary
      await pool.query(
        'INSERT INTO reports (project_id, summary) VALUES ($1, $2)',
        [req.body.projectId, JSON.stringify({
          plain_text_report: reportData.plain_text_report,
          json_summary: reportData.json_summary,
          report_type: 'pmo_status_report'
        })]
      );
      
      // Update project with status if available
      if (reportData.json_summary?.executive_summary?.status) {
        await pool.query(
          'UPDATE projects SET status = $1 WHERE id = $2',
          [reportData.json_summary.executive_summary.status, req.body.projectId]
        );
      }
      
      // Update risk score if available in metrics
      if (reportData.json_summary?.metrics?.project_health_score !== undefined) {
        await pool.query(
          'UPDATE projects SET risk_score = $1 WHERE id = $2',
          [reportData.json_summary.metrics.project_health_score, req.body.projectId]
        );
      }
    }

    res.json(response.data);
  } catch (error) {
    console.error('AI PMO Report error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PMO report', 
      details: error.response?.data?.detail || error.message 
    });
  }
});

export default router;

