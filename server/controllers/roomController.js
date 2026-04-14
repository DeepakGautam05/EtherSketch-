import Room from '../models/Room.js';
import { v4 as uuidv4 } from 'uuid';

export const createRoom = async (req, res) => {
  const { name } = req.body;
  try {
    const roomId = uuidv4();
    const room = await Room.create({
      roomId,
      name: name || `Room-${roomId.substring(0,6)}`,
      owner: req.user._id
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveRoomData = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { canvasData: req.body.canvasData },
      { new: true }
    );
    res.json({ message: 'Room saved successfully', room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
