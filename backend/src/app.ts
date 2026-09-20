import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 image uploads

// Routes
import trackingRoutes from './routes/tracking';
import usersRoutes from './routes/users';
import pinsRoutes from './routes/pins';

app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/pins', pinsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SafeRoute Backend' });
});

export default app;
