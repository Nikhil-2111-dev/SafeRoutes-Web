import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const router = Router();
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = "SafeRouteUsers";

// Configure multer for local file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename using Cognito sub and original extension
    const ext = path.extname(file.originalname);
    cb(null, `${req.user?.sub || 'unknown'}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

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
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    try {
      fs.writeFileSync('dynamodb_error.log', JSON.stringify({ name: error.name, message: error.message, stack: error.stack }, null, 2));
    } catch (e) {}
    res.status(500).json({ error: 'Internal Server Error', details: error?.message || error?.toString() });
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
    res.status(500).json({ error: 'Internal Server Error', details: (error as any)?.message || (error as any)?.toString() });
  }
});

// POST /api/v1/users/profile-image - Upload Profile Image
router.post('/profile-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { sub } = req.user;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Construct the local URL for the uploaded image
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const pictureUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Attempt to update DynamoDB (fails gracefully if no AWS credentials)
    try {
      await docClient.send(new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId: sub },
        UpdateExpression: "set pictureUrl = :url, updatedAt = :time",
        ExpressionAttributeValues: {
          ":url": pictureUrl,
          ":time": new Date().toISOString()
        }
      }));
    } catch (dbError) {
      console.warn("Failed to update DynamoDB profile with image URL (likely missing AWS credentials). Image is saved locally.");
    }

    res.status(200).json({ message: "Image uploaded successfully", pictureUrl });
  } catch (error: any) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error?.message || error?.toString() });
  }
});

export default router;
