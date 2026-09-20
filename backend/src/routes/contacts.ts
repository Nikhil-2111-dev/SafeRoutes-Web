import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

const router = Router();
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const CONTACTS_TABLE = "SafeRouteContacts";

// GET /api/v1/contacts - Get all contacts for authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { sub } = req.user;
    
    const response = await docClient.send(new QueryCommand({
      TableName: CONTACTS_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${sub}`,
        ':skPrefix': 'CONTACT#'
      }
    }));

    res.status(200).json(response.Items || []);
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
});

// POST /api/v1/contacts - Create a new contact
router.post('/', requireAuth, async (req, res) => {
  try {
    const { sub } = req.user;
    const { name, phoneNumber, relationship, isPrimary } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    // Validate and format phone number (defaults to IN for India)
    let formattedPhone = phoneNumber;
    try {
      const phoneNumberParsed = parsePhoneNumberWithError(phoneNumber, 'IN');
      if (!phoneNumberParsed.isValid()) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
      formattedPhone = phoneNumberParsed.format('E.164'); // e.g. +919876543210
    } catch (e) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check limit (Max 5)
    const existing = await docClient.send(new QueryCommand({
      TableName: CONTACTS_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${sub}`,
        ':skPrefix': 'CONTACT#'
      }
    }));
    
    if (existing.Items && existing.Items.length >= 5) {
      return res.status(400).json({ error: 'Maximum of 5 emergency contacts allowed' });
    }

    const contactId = uuidv4();
    const newContact = {
      PK: `USER#${sub}`,
      SK: `CONTACT#${contactId}`,
      id: contactId,
      userId: sub,
      name,
      phoneNumber: formattedPhone,
      relationship: relationship || 'Family',
      isPrimary: Boolean(isPrimary),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If this is primary, we should unset others (simple implementation: just save it, frontend logic can handle unchecking others for now)
    
    await docClient.send(new PutCommand({
      TableName: CONTACTS_TABLE,
      Item: newContact
    }));

    res.status(201).json(newContact);
  } catch (error: any) {
    console.error("Error creating contact:", error);
    try { require('fs').writeFileSync('post_contact_error.log', JSON.stringify({ message: error?.message, stack: error?.stack })); } catch(e){}
    res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
});

// DELETE /api/v1/contacts/:contactId - Delete a contact
router.delete('/:contactId', requireAuth, async (req, res) => {
  try {
    const { sub } = req.user;
    const { contactId } = req.params;

    await docClient.send(new DeleteCommand({
      TableName: CONTACTS_TABLE,
      Key: {
        PK: `USER#${sub}`,
        SK: `CONTACT#${contactId}`
      }
    }));

    res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (error: any) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
});

// PUT /api/v1/contacts/:contactId - Update a contact
router.put('/:contactId', requireAuth, async (req, res) => {
  try {
    const { sub } = req.user;
    const { contactId } = req.params;
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    // Validate and format phone number
    let formattedPhone = phoneNumber;
    try {
      const phoneNumberParsed = parsePhoneNumberWithError(phoneNumber, 'IN');
      if (!phoneNumberParsed.isValid()) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
      formattedPhone = phoneNumberParsed.format('E.164');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    await docClient.send(new UpdateCommand({
      TableName: CONTACTS_TABLE,
      Key: {
        PK: `USER#${sub}`,
        SK: `CONTACT#${contactId}`
      },
      UpdateExpression: "set #n = :name, phoneNumber = :phone, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#n": "name"
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":phone": formattedPhone,
        ":updatedAt": new Date().toISOString()
      }
    }));

    res.status(200).json({ success: true, message: 'Contact updated' });
  } catch (error: any) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
});

export default router;
