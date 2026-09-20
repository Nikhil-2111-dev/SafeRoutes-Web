import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

console.log("PinService init, Access Key:", process.env.AWS_ACCESS_KEY_ID ? "present" : "missing");
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);
const PINS_TABLE = "SafeRoutePins";

export interface PinInput {
  userId: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  tags?: string[];
  imageUrl?: string; // Optional if we store it later
}

export class PinService {
  async createPin(input: PinInput) {
    const pin = {
      id: randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    await docClient.send(new PutCommand({
      TableName: PINS_TABLE,
      Item: pin
    }));

    return pin;
  }

  async getAllActivePins() {
    // In production, use GSI to query only 'active' pins efficiently
    // For this prototype, Scan is acceptable
    const response = await docClient.send(new ScanCommand({
      TableName: PINS_TABLE,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": "active"
      }
    }));

    return response.Items || [];
  }
}
