import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Server } from 'socket.io';

const router = Router();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'SafeRouteIncidents';

// GET all active incidents
router.get('/', async (req, res) => {
  try {
    // In production, use query with GSI for active status. 
    // Using scan for hackathon prototype brevity
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
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch incidents' });
  }
});

// POST a new incident
router.post('/', async (req, res) => {
  const { category, description, latitude, longitude, reportedBy } = req.body;

  if (!category || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const incident = {
    incidentId: uuidv4(),
    category,
    description: description || '',
    latitude,
    longitude,
    severity: 3, // Default -3 points impact
    status: 'active',
    createdAt: new Date().toISOString(),
    reportedBy: reportedBy || 'anonymous'
  };

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: incident
    });

    await docClient.send(command);

    // Emit real-time event to all connected clients
    const io: Server = req.app.get('io');
    if (io) {
      io.emit('new_incident', incident);
    }

    res.status(201).json({ success: true, incident });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ success: false, error: 'Failed to create incident' });
  }
});

export default router;
