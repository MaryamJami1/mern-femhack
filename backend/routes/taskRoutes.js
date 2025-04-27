import express from 'express';
import { createTask, getTasks, updateTask, deleteTask , moveTask} from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.post('/', protect, createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.patch('/:id/move', protect, moveTask);

export default router;
