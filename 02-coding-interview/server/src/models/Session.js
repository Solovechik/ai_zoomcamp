import { query } from '../config/database.js';
import { generateUniqueSessionId } from '../utils/sessionIdGenerator.js';

/**
 * Check if a session exists
 * @param {string} sessionId
 * @returns {Promise<boolean>}
 */
export async function sessionExists(sessionId) {
  const result = await query(
    'SELECT id FROM sessions WHERE session_id = $1',
    [sessionId]
  );
  return result.rowCount > 0;
}

/**
 * Create a new session
 * @param {string} initialCode - Optional initial code
 * @returns {Promise<Object>} Created session object
 */
export async function createSession(initialCode = '# Write your Python code here\n') {
  const sessionId = await generateUniqueSessionId(sessionExists);

  const result = await query(
    `INSERT INTO sessions (session_id, code_content)
     VALUES ($1, $2)
     RETURNING id, session_id, created_at, code_content, execution_results, metadata`,
    [sessionId, initialCode]
  );

  return result.rows[0];
}

/**
 * Get a session by session_id
 * @param {string} sessionId
 * @returns {Promise<Object|null>} Session object or null if not found
 */
export async function getSession(sessionId) {
  const result = await query(
    `SELECT id, session_id, created_at, updated_at, code_content, execution_results, metadata
     FROM sessions
     WHERE session_id = $1`,
    [sessionId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Update session code content
 * @param {string} sessionId
 * @param {string} code
 * @returns {Promise<Object|null>} Updated session or null
 */
export async function updateSessionCode(sessionId, code) {
  const result = await query(
    `UPDATE sessions
     SET code_content = $1, updated_at = CURRENT_TIMESTAMP
     WHERE session_id = $2
     RETURNING id, session_id, updated_at, code_content`,
    [code, sessionId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Save execution result to session
 * @param {string} sessionId
 * @param {Object} executionResult - Object with output, error, executionTime
 * @returns {Promise<Object|null>} Updated session or null
 */
export async function saveExecutionResult(sessionId, executionResult) {
  const result = await query(
    `UPDATE sessions
     SET execution_results = execution_results || $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE session_id = $2
     RETURNING id, session_id, execution_results`,
    [JSON.stringify([{ ...executionResult, timestamp: new Date() }]), sessionId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Delete a session
 * @param {string} sessionId
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteSession(sessionId) {
  const result = await query(
    'DELETE FROM sessions WHERE session_id = $1',
    [sessionId]
  );

  return result.rowCount > 0;
}

/**
 * Get all sessions (for admin/debugging purposes)
 * @param {number} limit
 * @returns {Promise<Array>} Array of sessions
 */
export async function getAllSessions(limit = 50) {
  const result = await query(
    `SELECT id, session_id, created_at, updated_at,
            LEFT(code_content, 100) as code_preview,
            metadata
     FROM sessions
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
}
