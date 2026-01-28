import { Router } from 'express';
import * as habitController from '../controllers/habitController.js';

const router = Router();

router.get('/', habitController.getAllHabits);
router.post('/', habitController.createHabit);
router.get('/:id', habitController.getHabitById);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

export default router;
