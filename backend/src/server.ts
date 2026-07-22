import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Set to frontend URL in production
  },
});

import authRoutes from './routes/auth.routes';
import roleRoutes from './routes/role.routes';
import userRoutes from './routes/user.routes';
import platformRoutes from './routes/platform.routes';
import rateCardRoutes from './routes/ratecard.routes';
import projectRoutes from './routes/project.routes';
import uploadRoutes from './routes/upload.routes';
import financeRoutes from './routes/finance.routes';
import brandRoutes from './routes/brand.routes';
import paymentRoutes from './routes/payment.routes';
import shipmentRoutes from './routes/shipment.routes';
import bankAccountRoutes from './routes/bankAccount.routes';
import scriptRoutes from './routes/script.routes';
import chatRoutes from './routes/chat.routes';
import settingsRoutes from './routes/settings.routes';
import dashboardRoutes from './routes/dashboard.routes';
import notificationRoutes from './routes/notification.routes';
import path from 'path';

// ... (other middlewares)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/ratecards', rateCardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/projects/:id/scripts', scriptRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BMS Backend is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BMS API. Use /api/health to check status.' });
});

// Socket.io for chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT as number, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
