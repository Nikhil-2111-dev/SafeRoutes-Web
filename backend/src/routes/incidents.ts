import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Server } from 'socket.io';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'SafeRouteIncidents';

// In-memory fallback for local development without AWS credentials
const fallbackIncidents: any[] = [];

// GET all active incidents
router.get('/', async (req, res) => {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'active'
      }
    });

    const response = await docClient.send(command);
    res.status(200).json({ success: true, incidents: response.Items });
  } catch (error: any) {
    console.warn('DynamoDB fetch incidents failed, using in-memory fallback:', error.message);
    return res.status(200).json({ success: true, incidents: fallbackIncidents.filter(i => i.status === 'active') });
  }
});

// POST a new incident (Authenticated)
router.post('/', requireAuth, async (req, res) => {
  const { category, description, latitude, longitude, severity, tags } = req.body;

  if (!category || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const now = new Date().toISOString();
  
  const incident = {
    incidentId: uuidv4(),
    incidentType: category,
    description: description || '',
    latitude,
    longitude,
    severity: severity || 3, 
    tags: Array.isArray(tags) ? tags : [],
    status: 'active',
    reportedAt: now,
    lastUpdatedAt: now,
    reporterUserId: req.user?.sub || 'anonymous',
    confidenceScore: 50, // Base starting confidence
    confirmationCount: 0
  };

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: incident
    });

    await docClient.send(command);
  } catch (error: any) {
    if (error.name === 'CredentialsProviderError' || error.name === 'UnrecognizedClientException') {
      console.warn('AWS Credentials missing, using in-memory fallback for POST /incidents');
      fallbackIncidents.push(incident);
    } else {
      console.error('Error creating incident:', error);
      return res.status(500).json({ success: false, error: 'Failed to create incident' });
    }
  }

  // Emit real-time event to all connected clients
  const io: Server = req.app.get('io');
  if (io) {
    io.emit('new_incident', incident);
  }

  res.status(201).json({ success: true, incident });
});

// Export fallback for routing.ts to use
export { fallbackIncidents };
export default router;
