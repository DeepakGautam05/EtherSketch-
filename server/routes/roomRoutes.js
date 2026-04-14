import express from 'express';
import { createRoom, getRoom, saveRoomData } from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRoom);
router.get('/:roomId', protect, getRoom);
router.put('/:roomId/save', protect, saveRoomData);

export default router;
