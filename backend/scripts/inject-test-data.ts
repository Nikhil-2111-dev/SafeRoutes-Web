/// <reference types="node" />
import 'dotenv/config';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);
const PINS_TABLE = "SafeRoutePins";

const dummyPins = [
  {
    type: 'danger',
    description: 'Very dark alleyway, streetlights broken',
    tags: ['poorly-lit', 'dangerous'],
    latitude: 51.5072, // Change these coordinates to your actual area if needed
    longitude: -0.1276
  },
  {
    type: 'safe',
    description: 'Police patrol usually here at night',
    tags: ['safe-area', 'police-presence', 'well-lit'],
    latitude: 51.5095,
    longitude: -0.1245
  },
  {
    type: 'warning',
    description: 'Uneven pavement and construction work',
    tags: ['hazard', 'dirty'],
    latitude: 51.5120,
    longitude: -0.1300
  },
  {
    type: 'incident',
    description: 'Suspicious activity reported earlier',
    tags: ['unsafe'],
    latitude: 51.5050,
    longitude: -0.1230
  }
];

async function injectData() {
  console.log("Starting test data injection...");
  for (const pin of dummyPins) {
    const item = {
      id: randomUUID(),
      userId: 'test-user-injector',
      createdAt: new Date().toISOString(),
      status: 'active',
      ...pin
    };
    
    try {
      await docClient.send(new PutCommand({
        TableName: PINS_TABLE,
        Item: item
      }));
      console.log(`Successfully inserted pin: ${pin.type}`);
    } catch (error) {
      console.error(`Failed to insert pin:`, error);
    }
  }
  console.log("Finished injection.");
}

injectData();
