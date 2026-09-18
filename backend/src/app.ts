import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
import trackingRoutes from './routes/tracking';
import usersRoutes from './routes/users';

app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/v1/users', usersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SafeRoute Backend' });
});

export default app;
