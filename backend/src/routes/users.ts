import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const router = Router();
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = "SafeRouteUsers";

// GET /api/v1/users/me - Retrieve Application Profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { sub } = req.user; // Securely extracted from Cognito JWT

    const response = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: sub } // userId is the Cognito sub
    }));

    if (!response.Item) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json(response.Item);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/v1/users/profile - Create or Sync Application Profile (Called right after login/signup)
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { sub, email, name, phoneNumber, birthdate, gender, address } = req.user;

    // First check if they exist
    const getResponse = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: sub }
    }));

    if (getResponse.Item) {
      // Profile exists (returning login, or Google Sync)
      // Update lastLoginAt
      await docClient.send(new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId: sub },
        UpdateExpression: "set lastLoginAt = :time, updatedAt = :time",
        ExpressionAttributeValues: {
          ":time": new Date().toISOString()
        }
      }));
      return res.status(200).json({ message: "Profile synchronized", profile: getResponse.Item });
    }

    // Create new profile
    const newProfile = {
      userId: sub,
      cognitoSub: sub,
      email: email,
      name: name || "Unknown User",
      phone_number: phoneNumber || "Unknown",
      birthdate: birthdate || "",
      gender: gender || "",
      address: address || "",
      role: "user",
      trustedContacts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: newProfile
    }));

    res.status(201).json({ message: "Profile created", profile: newProfile });
  } catch (error) {
    console.error("Error creating user profile:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
