/**
 * In-memory session manager for tracking active users and sessions
 */
class SessionManager {
  constructor() {
    // sessionId -> Set of socket IDs
    this.sessions = new Map();

    // socketId -> { userId, sessionIds: Set }
    this.users = new Map();
  }

  /**
   * Add a user to a session
   * @param {string} sessionId
   * @param {string} socketId
   * @param {string} userId
   */
  addUser(sessionId, socketId, userId) {
    // Add to session
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Set());
    }
    this.sessions.get(sessionId).add(socketId);

    // Add to users
    if (!this.users.has(socketId)) {
      this.users.set(socketId, {
        userId,
        sessionIds: new Set()
      });
    }
    this.users.get(socketId).sessionIds.add(sessionId);

    console.log(`User ${userId} (${socketId}) joined session ${sessionId}`);
  }

  /**
   * Remove a user from all sessions
   * @param {string} socketId
   * @returns {string[]} Array of session IDs the user was in
   */
  removeUser(socketId) {
    const user = this.users.get(socketId);
    if (!user) return [];

    const sessionIds = Array.from(user.sessionIds);

    // Remove from all sessions
    sessionIds.forEach(sessionId => {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.delete(socketId);
        if (session.size === 0) {
          this.sessions.delete(sessionId);
        }
      }
    });

    this.users.delete(socketId);
    console.log(`User ${user.userId} (${socketId}) removed from ${sessionIds.length} sessions`);

    return sessionIds;
  }

  /**
   * Get the number of participants in a session
   * @param {string} sessionId
   * @returns {number}
   */
  getParticipantCount(sessionId) {
    return this.sessions.get(sessionId)?.size || 0;
  }

  /**
   * Get all socket IDs in a session
   * @param {string} sessionId
   * @returns {string[]}
   */
  getSessionParticipants(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? Array.from(session) : [];
  }

  /**
   * Get user ID from socket ID
   * @param {string} socketId
   * @returns {string|null}
   */
  getUserId(socketId) {
    return this.users.get(socketId)?.userId || null;
  }

  /**
   * Get all active sessions
   * @returns {string[]}
   */
  getActiveSessions() {
    return Array.from(this.sessions.keys());
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    return {
      activeSessions: this.sessions.size,
      connectedUsers: this.users.size,
      sessions: Array.from(this.sessions.entries()).map(([sessionId, sockets]) => ({
        sessionId,
        participants: sockets.size
      }))
    };
  }
}

export default new SessionManager();
