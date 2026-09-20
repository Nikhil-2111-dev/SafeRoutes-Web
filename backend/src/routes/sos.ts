import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const SOS_TABLE = "SafeRouteSOS";
const CONTACTS_TABLE = "SafeRouteContacts";
const USERS_TABLE = "SafeRouteUsers";

router.post('/', requireAuth, async (req, res) => {
  try {
    const { sub } = req.user;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required to trigger SOS' });
    }

    // 1. Fetch User Profile to get Name
    const userProfile = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: sub }
    }));
    const userName = userProfile.Item?.name || "A SafeRoute user";

    // 2. Fetch Emergency Contacts
    const contactsResponse = await docClient.send(new QueryCommand({
      TableName: CONTACTS_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${sub}`,
        ':skPrefix': 'CONTACT#'
      }
    }));

    const contacts = contactsResponse.Items || [];

    if (contacts.length === 0) {
      return res.status(200).json({
        message: 'No emergency contacts configured.',
        contacts: []
      });
    }

    // 3. Construct the SMS Message
    const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const message = `SAFEROUTE SOS: ${userName} is in danger and has triggered an emergency alert.\n\nCurrent location:\n${locationUrl}\n\nPlease contact them immediately.`;

    // 4. Record SOS Event
    const sosId = `SOS#${uuidv4()}`;
    await docClient.send(new PutCommand({
      TableName: SOS_TABLE,
      Item: {
        sosId,
        userId: sub,
        triggeredAt: new Date().toISOString(),
        latitude,
        longitude
      }
    }));

    // 5. Return SMS payload to Frontend
    const mappedContacts = contacts.map(c => ({
      name: c.name,
      phone: typeof c.phoneNumber === 'object' ? c.phoneNumber.formatted : c.phoneNumber
    }));

    res.status(201).json({
      message: 'SOS Triggered successfully',
      sosId,
      smsBody: message,
      contacts: mappedContacts
    });

  } catch (error: any) {
    console.error("Error triggering SOS:", error);
    require('fs').writeFileSync('sos-error.log', error.stack || error.toString());
    res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
});

export default router;
