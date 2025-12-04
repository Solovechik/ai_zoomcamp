import { getSession, updateSessionCode, saveExecutionResult } from '../models/Session.js';
import SessionManager from './sessionManager.js';

// Debounce map: sessionId -> timeout
const saveDebounce = new Map();

/**
 * Setup all Socket.io event handlers
 * @param {Server} io - Socket.io server instance
 */
export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    /**
     * Handle user joining a session
     */
    socket.on('join_session', async ({ sessionId, userId }) => {
      try {
        // Validate session exists in database
        const session = await getSession(sessionId);
        if (!session) {
          socket.emit('error', {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND'
          });
          return;
        }

        // Join Socket.io room
        socket.join(sessionId);

        // Track in session manager
        SessionManager.addUser(sessionId, socket.id, userId);

        const participantCount = SessionManager.getParticipantCount(sessionId);

        // Send current state to the user who just joined
        socket.emit('session_joined', {
          sessionId,
          currentCode: session.code_content,
          participants: participantCount,
          executionResults: session.execution_results
        });

        // Notify others in the session
        socket.to(sessionId).emit('participants_changed', {
          participants: participantCount,
          action: 'joined',
          userId
        });

        console.log(`✓ User ${userId} joined session ${sessionId} (${participantCount} participants)`);
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', {
          message: 'Failed to join session',
          code: 'JOIN_ERROR'
        });
      }
    });

    /**
     * Handle code changes from users
     */
    socket.on('code_change', ({ sessionId, code, cursorPosition }) => {
      const userId = SessionManager.getUserId(socket.id);

      // Broadcast to all others in the room (excluding sender)
      socket.to(sessionId).emit('code_update', {
        code,
        userId,
        cursorPosition,
        timestamp: Date.now()
      });

      // Debounced database save (2 seconds)
      if (saveDebounce.has(sessionId)) {
        clearTimeout(saveDebounce.get(sessionId));
      }

      const timeoutId = setTimeout(async () => {
        try {
          await updateSessionCode(sessionId, code);
          console.log(`✓ Saved code for session ${sessionId} (debounced)`);
          saveDebounce.delete(sessionId);
        } catch (error) {
          console.error('Error saving code to database:', error);
        }
      }, 2000);

      saveDebounce.set(sessionId, timeoutId);
    });

    /**
     * Handle code execution started event
     */
    socket.on('execute_code', ({ sessionId, code }) => {
      const userId = SessionManager.getUserId(socket.id);

      // Broadcast to all participants that execution started
      io.to(sessionId).emit('execution_started', {
        userId,
        timestamp: Date.now()
      });

      console.log(`✓ Code execution started in session ${sessionId} by ${userId}`);
    });

    /**
     * Handle execution results
     */
    socket.on('execution_result', async ({ sessionId, output, error, executionTime }) => {
      const userId = SessionManager.getUserId(socket.id);

      const result = {
        output,
        error,
        executionTime,
        userId,
        timestamp: Date.now()
      };

      // Broadcast results to all participants
      io.to(sessionId).emit('execution_result', result);

      // Save to database
      try {
        await saveExecutionResult(sessionId, result);
        console.log(`✓ Execution result saved for session ${sessionId}`);
      } catch (err) {
        console.error('Error saving execution result:', err);
      }
    });

    /**
     * Handle language change events
     */
    socket.on('language_change', ({ sessionId, language, code }) => {
      const userId = SessionManager.getUserId(socket.id);

      // Broadcast language change to all others in the room
      socket.to(sessionId).emit('language_changed', {
        language,
        code,
        userId,
        timestamp: Date.now()
      });

      console.log(`✓ Language changed to ${language} in session ${sessionId} by ${userId}`);
    });

    /**
     * Handle cursor position updates (optional feature)
     */
    socket.on('cursor_move', ({ sessionId, position }) => {
      const userId = SessionManager.getUserId(socket.id);

      // Broadcast cursor position to others
      socket.to(sessionId).emit('cursor_update', {
        userId,
        position,
        socketId: socket.id
      });
    });

    /**
     * Handle user typing indicator (optional feature)
     */
    socket.on('typing', ({ sessionId, isTyping }) => {
      const userId = SessionManager.getUserId(socket.id);

      socket.to(sessionId).emit('user_typing', {
        userId,
        isTyping
      });
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      const sessionIds = SessionManager.removeUser(socket.id);

      // Notify all affected sessions
      sessionIds.forEach(sessionId => {
        const participantCount = SessionManager.getParticipantCount(sessionId);

        io.to(sessionId).emit('participants_changed', {
          participants: participantCount,
          action: 'left'
        });

        // If session is empty, clear any pending debounced saves
        if (participantCount === 0 && saveDebounce.has(sessionId)) {
          const timeoutId = saveDebounce.get(sessionId);
          clearTimeout(timeoutId);
          saveDebounce.delete(sessionId);
          console.log(`✓ Cleared debounced save for empty session ${sessionId}`);
        }
      });

      console.log(`✗ Client disconnected: ${socket.id}`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Admin endpoint to get session statistics
  io.on('get_stats', (callback) => {
    const stats = SessionManager.getStats();
    callback(stats);
  });
}
