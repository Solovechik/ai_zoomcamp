import { Router } from 'express';
import * as completionController from '../controllers/completionController.js';

const router = Router();

router.post('/', completionController.createCompletion);
router.delete('/', completionController.deleteCompletion);
router.get('/:habitId', completionController.getCompletions);

export default router;
