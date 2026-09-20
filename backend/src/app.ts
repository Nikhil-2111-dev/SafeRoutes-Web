import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
import trackingRoutes from './routes/tracking';
import usersRoutes from './routes/users';
import incidentsRoutes from './routes/incidents';
import routingRoutes from './routes/routing';
import searchRoutes from './routes/search';
import contactsRoutes from './routes/contacts';
import sosRoutes from './routes/sos';

app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/incidents', incidentsRoutes);
app.use('/api/v1/route', routingRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/contacts', contactsRoutes);
app.use('/api/v1/sos', sosRoutes);


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SafeRoute Backend' });
});

export default app;
