import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  canvasData: { type: Object, default: {} } // For phase 6 auto-save
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
