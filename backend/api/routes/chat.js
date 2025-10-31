// AI Chat routes - Phase 3
import express from 'express';
import axios from 'axios';
import authenticateToken from '../middleware/auth.js';
import pool from '../../db/connection.js';

const router = express.Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Get all conversations for user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [conversations] = await pool.execute(
      `SELECT 
        id, 
        project_id, 
        title, 
        language,
        created_at, 
        updated_at,
        (SELECT COUNT(*) FROM ai_messages WHERE conversation_id = ai_conversations.id) as message_count
      FROM ai_conversations 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
      LIMIT 50`,
      [userId]
    );

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation with messages
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get conversation
    const [conversations] = await pool.execute(
      'SELECT * FROM ai_conversations WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = conversations[0];

    // Get messages
    const [messages] = await pool.execute(
      'SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [id]
    );

    res.json({
      ...conversation,
      messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, title, language = 'en' } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO ai_conversations (user_id, project_id, title, language) VALUES (?, ?, ?, ?)',
      [userId, projectId || null, title || 'New Conversation', language]
    );

    res.json({
      id: result.insertId,
      user_id: userId,
      project_id: projectId || null,
      title: title || 'New Conversation',
      language,
      messages: []
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send message to AI
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, message, projectId, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let convId = conversationId;

    // Create conversation if not provided
    if (!convId) {
      const [result] = await pool.execute(
        'INSERT INTO ai_conversations (user_id, project_id, title, language) VALUES (?, ?, ?, ?)',
        [userId, projectId || null, message.substring(0, 100) || 'New Conversation', language]
      );
      convId = result.insertId;
    }

    // Save user message
    const [messageResult] = await pool.execute(
      'INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [convId, 'user', message]
    );

    const startTime = Date.now();

    // Fetch conversation history for context
    const [messages] = await pool.execute(
      'SELECT role, content FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [convId]
    );

    // Build conversation history for AI
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Fetch project context if projectId provided
    let projectContext = null;
    if (projectId) {
      const [projects] = await pool.execute(
        'SELECT * FROM projects WHERE id = ? AND user_id = ?',
        [projectId, userId]
      );
      if (projects.length > 0) {
        projectContext = projects[0];
      }
    }

    // Send to AI Engine
    let aiResponse;
    try {
      const response = await axios.post(
        `${AI_ENGINE_URL}/chat`,
        {
          message,
          conversation_history: conversationHistory,
          project_context: projectContext,
          language
        },
        {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
          },
          timeout: 60000 // 60 second timeout
        }
      );

      aiResponse = response.data.response || response.data.message || 'No response from AI';
    } catch (error) {
      console.error('AI Engine error:', error);
      aiResponse = 'I apologize, but I encountered an error processing your request. Please try again later.';
    }

    // Save AI response
    await pool.execute(
      'INSERT INTO ai_messages (conversation_id, role, content, metadata) VALUES (?, ?, ?, ?)',
      [convId, 'assistant', aiResponse, JSON.stringify({ tokens: 0, duration: Date.now() - startTime })]
    );

    // Update conversation timestamp
    await pool.execute(
      'UPDATE ai_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [convId]
    );

    // Log AI usage
    const duration = Date.now() - startTime;
    await pool.execute(
      `INSERT INTO ai_usage_logs (user_id, project_id, endpoint, request_data, response_data, duration_ms, language)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        projectId || null,
        'chat',
        JSON.stringify({ message, conversationId: convId }),
        JSON.stringify({ response: aiResponse.substring(0, 500) }),
        duration,
        language
      ]
    );

    res.json({
      conversationId: convId,
      message: aiResponse,
      duration
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Delete conversation
router.delete('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const [conversations] = await pool.execute(
      'SELECT id FROM ai_conversations WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete messages first (cascade should handle this, but explicit is better)
    await pool.execute('DELETE FROM ai_messages WHERE conversation_id = ?', [id]);
    
    // Delete conversation
    await pool.execute('DELETE FROM ai_conversations WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;

