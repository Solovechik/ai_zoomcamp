import express from 'express';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();

// Create a new session
router.post('/', sessionController.createNewSession);

// Get all sessions (admin/debugging)
router.get('/', sessionController.getAllSessions);

// Get a specific session
router.get('/:id', sessionController.getSessionById);

// Update session code
router.put('/:id/code', sessionController.updateSessionCode);

// Delete a session
router.delete('/:id', sessionController.deleteSessionById);

export default router;
