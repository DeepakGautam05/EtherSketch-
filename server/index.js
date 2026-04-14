import 'dotenv/config';
import { setServers } from 'node:dns/promises';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { YSocketIO } from 'y-socket.io/dist/server';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: '*', // We can change this to specific client domains later
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize Yjs Socket.io Sync
const ysocketio = new YSocketIO(io);
ysocketio.initialize();

app.get('/', (req, res) => {
  res.send('EtherSketch Backend API is running');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.log('⚠️ MONGO_URI not provided, skipping MongoDB connection.');
}

// Socket connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Setup basic yjs/collaboration socket events later
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
