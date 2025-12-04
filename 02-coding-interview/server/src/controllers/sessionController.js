import * as Session from '../models/Session.js';

/**
 * Create a new session
 * POST /api/sessions
 */
export async function createNewSession(req, res) {
  try {
    const { initialCode } = req.body;
    const session = await Session.createSession(initialCode);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.session_id,
        createdAt: session.created_at,
        codeContent: session.code_content
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
}

/**
 * Get a session by ID
 * GET /api/sessions/:id
 */
export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.getSession(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.session_id,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        codeContent: session.code_content,
        executionResults: session.execution_results,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session'
    });
  }
}

/**
 * Update session code
 * PUT /api/sessions/:id/code
 */
export async function updateSessionCode(req, res) {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code must be a string'
      });
    }

    const session = await Session.updateSessionCode(id, code);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.session_id,
        updatedAt: session.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating session code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update session code'
    });
  }
}

/**
 * Get all sessions (admin endpoint)
 * GET /api/sessions
 */
export async function getAllSessions(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const sessions = await Session.getAllSessions(limit);

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions'
    });
  }
}

/**
 * Delete a session
 * DELETE /api/sessions/:id
 */
export async function deleteSessionById(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Session.deleteSession(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete session'
    });
  }
}
