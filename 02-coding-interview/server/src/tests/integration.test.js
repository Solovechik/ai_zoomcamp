import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { io as Client } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';

let socket1, socket2;
let testSessionId;

// Helper to wait for socket event
const waitForEvent = (socket, eventName, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeout);

    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
};

describe('Integration Tests: REST API + WebSocket', () => {

  // ==================== REST API TESTS ====================

  describe('REST API - Session Management', () => {

    it('should create a new session', async () => {
      const response = await axios.post(`${API_URL}/sessions`, {
        initialCode: '# Test code'
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.sessionId).toBeTruthy();
      expect(response.data.data.sessionId).toHaveLength(8);
      expect(response.data.data.codeContent).toBe('# Test code');

      testSessionId = response.data.data.sessionId;
    });

    it('should retrieve an existing session', async () => {
      const response = await axios.get(`${API_URL}/sessions/${testSessionId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.sessionId).toBe(testSessionId);
      expect(response.data.data.codeContent).toBe('# Test code');
    });

    it('should return 404 for non-existent session', async () => {
      try {
        await axios.get(`${API_URL}/sessions/INVALID1`);
        throw new Error('Should have thrown 404');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
      }
    });

    it('should update session code', async () => {
      const newCode = 'print("Updated code")';
      const response = await axios.put(`${API_URL}/sessions/${testSessionId}/code`, {
        code: newCode
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // Verify the update
      const getResponse = await axios.get(`${API_URL}/sessions/${testSessionId}`);
      expect(getResponse.data.data.codeContent).toBe(newCode);
    });

    it('should list all sessions', async () => {
      const response = await axios.get(`${API_URL}/sessions`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });
  });

  // ==================== WEBSOCKET TESTS ====================

  describe('WebSocket - Real-time Collaboration', () => {

    beforeAll(() => {
      socket1 = Client(SOCKET_URL, {
        transports: ['websocket']
      });
      socket2 = Client(SOCKET_URL, {
        transports: ['websocket']
      });
    });

    afterAll(() => {
      if (socket1) socket1.disconnect();
      if (socket2) socket2.disconnect();
    });

    it('should connect two clients via WebSocket', (done) => {
      let connectedCount = 0;

      const checkBothConnected = () => {
        connectedCount++;
        if (connectedCount === 2) {
          expect(socket1.connected).toBe(true);
          expect(socket2.connected).toBe(true);
          done();
        }
      };

      socket1.on('connect', checkBothConnected);
      socket2.on('connect', checkBothConnected);
    });

    it('should allow users to join a session', async () => {
      const userId1 = 'test-user-1';
      const userId2 = 'test-user-2';

      // User 1 joins
      socket1.emit('join_session', {
        sessionId: testSessionId,
        userId: userId1
      });

      const joinData1 = await waitForEvent(socket1, 'session_joined');
      expect(joinData1.sessionId).toBe(testSessionId);
      expect(joinData1.participants).toBe(1);
      expect(joinData1.currentCode).toBeTruthy();

      // User 2 joins
      socket2.emit('join_session', {
        sessionId: testSessionId,
        userId: userId2
      });

      const [joinData2, participantsChanged] = await Promise.all([
        waitForEvent(socket2, 'session_joined'),
        waitForEvent(socket1, 'participants_changed')
      ]);

      expect(joinData2.participants).toBe(2);
      expect(participantsChanged.participants).toBe(2);
      expect(participantsChanged.action).toBe('joined');
    });

    it('should broadcast code changes between users', async () => {
      const newCode = 'print("Real-time update")';

      // Socket 1 sends code change
      socket1.emit('code_change', {
        sessionId: testSessionId,
        code: newCode,
        cursorPosition: { line: 1, column: 10 }
      });

      // Socket 2 should receive the update
      const codeUpdate = await waitForEvent(socket2, 'code_update');

      expect(codeUpdate.code).toBe(newCode);
      expect(codeUpdate.cursorPosition).toBeDefined();
      expect(codeUpdate.timestamp).toBeTruthy();
    });

    it('should broadcast execution events', async () => {
      const testCode = 'print("Hello, World!")';

      // Socket 1 starts execution
      socket1.emit('execute_code', {
        sessionId: testSessionId,
        code: testCode
      });

      // Both sockets should receive execution_started
      const [started1, started2] = await Promise.all([
        waitForEvent(socket1, 'execution_started'),
        waitForEvent(socket2, 'execution_started')
      ]);

      expect(started1.userId).toBeTruthy();
      expect(started2.userId).toBeTruthy();

      // Send execution result
      socket1.emit('execution_result', {
        sessionId: testSessionId,
        output: 'Hello, World!',
        error: null,
        executionTime: '10ms'
      });

      // Both sockets should receive the result
      const [result1, result2] = await Promise.all([
        waitForEvent(socket1, 'execution_result'),
        waitForEvent(socket2, 'execution_result')
      ]);

      expect(result1.output).toBe('Hello, World!');
      expect(result1.executionTime).toBe('10ms');
      expect(result2.output).toBe('Hello, World!');
    });

    it('should handle user disconnect and update participant count', async () => {
      // Disconnect socket2
      socket2.disconnect();

      // Socket1 should receive participants_changed event
      const participantsChanged = await waitForEvent(socket1, 'participants_changed');

      expect(participantsChanged.participants).toBe(1);
      expect(participantsChanged.action).toBe('left');
    });

    it('should reject invalid session ID', (done) => {
      const socket3 = Client(SOCKET_URL, {
        transports: ['websocket']
      });

      socket3.on('connect', () => {
        socket3.emit('join_session', {
          sessionId: 'INVALID123',
          userId: 'test-user-3'
        });

        socket3.on('error', (error) => {
          expect(error.message).toBeTruthy();
          expect(error.code).toBe('SESSION_NOT_FOUND');
          socket3.disconnect();
          done();
        });
      });
    });
  });

  // ==================== END-TO-END FLOW TESTS ====================

  describe('End-to-End Flow', () => {

    it('should complete full collaboration workflow', async () => {
      // 1. Create a new session via REST API
      const createResponse = await axios.post(`${API_URL}/sessions`, {
        initialCode: '# Collaborative session'
      });
      const sessionId = createResponse.data.data.sessionId;

      // 2. Connect two users via WebSocket
      const user1Socket = Client(SOCKET_URL, { transports: ['websocket'] });
      const user2Socket = Client(SOCKET_URL, { transports: ['websocket'] });

      await Promise.all([
        waitForEvent(user1Socket, 'connect'),
        waitForEvent(user2Socket, 'connect')
      ]);

      // 3. Users join the session
      user1Socket.emit('join_session', { sessionId, userId: 'e2e-user-1' });
      user2Socket.emit('join_session', { sessionId, userId: 'e2e-user-2' });

      await Promise.all([
        waitForEvent(user1Socket, 'session_joined'),
        waitForEvent(user2Socket, 'session_joined')
      ]);

      // 4. User 1 edits code
      const editedCode = 'def hello():\n    print("Hello from user 1")';
      user1Socket.emit('code_change', {
        sessionId,
        code: editedCode,
        cursorPosition: { line: 2, column: 0 }
      });

      // 5. User 2 receives the update
      const codeUpdate = await waitForEvent(user2Socket, 'code_update');
      expect(codeUpdate.code).toBe(editedCode);

      // 6. Wait for code to be saved to DB (debounced 2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // 7. Verify code was persisted in database
      const getResponse = await axios.get(`${API_URL}/sessions/${sessionId}`);
      expect(getResponse.data.data.codeContent).toBe(editedCode);

      // 8. User 1 executes code
      user1Socket.emit('execute_code', { sessionId, code: editedCode });

      await Promise.all([
        waitForEvent(user1Socket, 'execution_started'),
        waitForEvent(user2Socket, 'execution_started')
      ]);

      // 9. Send execution result
      user1Socket.emit('execution_result', {
        sessionId,
        output: 'Hello from user 1',
        error: null,
        executionTime: '5ms'
      });

      const [result1, result2] = await Promise.all([
        waitForEvent(user1Socket, 'execution_result'),
        waitForEvent(user2Socket, 'execution_result')
      ]);

      expect(result1.output).toBe('Hello from user 1');
      expect(result2.output).toBe('Hello from user 1');

      // 10. Cleanup
      user1Socket.disconnect();
      user2Socket.disconnect();
    });
  });

  // ==================== STRESS TESTS ====================

  describe('Stress Tests', () => {

    it('should handle rapid code changes', async () => {
      const socket = Client(SOCKET_URL, { transports: ['websocket'] });
      await waitForEvent(socket, 'connect');

      socket.emit('join_session', {
        sessionId: testSessionId,
        userId: 'stress-test-user'
      });

      await waitForEvent(socket, 'session_joined');

      // Send 50 rapid code changes
      const changes = [];
      for (let i = 0; i < 50; i++) {
        const code = `# Change ${i}`;
        socket.emit('code_change', {
          sessionId: testSessionId,
          code,
          cursorPosition: { line: 1, column: i }
        });
        changes.push(code);
      }

      // Give it time to process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify last change was persisted (debounced)
      await new Promise(resolve => setTimeout(resolve, 2500));
      const response = await axios.get(`${API_URL}/sessions/${testSessionId}`);
      expect(response.data.data.codeContent).toBe(changes[changes.length - 1]);

      socket.disconnect();
    });

    it('should handle multiple concurrent sessions', async () => {
      // Create 5 sessions
      const sessions = await Promise.all(
        Array(5).fill(null).map((_, i) =>
          axios.post(`${API_URL}/sessions`, {
            initialCode: `# Session ${i}`
          })
        )
      );

      // Connect 2 users to each session
      const sockets = [];
      for (const sessionResponse of sessions) {
        const sessionId = sessionResponse.data.data.sessionId;

        const s1 = Client(SOCKET_URL, { transports: ['websocket'] });
        const s2 = Client(SOCKET_URL, { transports: ['websocket'] });

        await Promise.all([
          waitForEvent(s1, 'connect'),
          waitForEvent(s2, 'connect')
        ]);

        s1.emit('join_session', { sessionId, userId: `user-${sessionId}-1` });
        s2.emit('join_session', { sessionId, userId: `user-${sessionId}-2` });

        sockets.push(s1, s2);
      }

      // Verify all connected
      expect(sockets.length).toBe(10);
      sockets.forEach(s => expect(s.connected).toBe(true));

      // Cleanup
      sockets.forEach(s => s.disconnect());
    });
  });
});
