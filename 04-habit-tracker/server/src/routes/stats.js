import { Router } from 'express';
import * as statsController from '../controllers/statsController.js';

const router = Router();

router.get('/overview', statsController.getOverview);
router.get('/habits/:id', statsController.getHabitStats);

export default router;
