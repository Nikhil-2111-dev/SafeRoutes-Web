const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

async function createSOSTable() {
  const command = new CreateTableCommand({
    TableName: "SafeRouteSOS",
    AttributeDefinitions: [
      { AttributeName: "sosId", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "sosId", KeyType: "HASH" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  try {
    console.log("Creating table SafeRouteSOS...");
    const response = await client.send(command);
    console.log("Table created successfully:", response.TableDescription.TableStatus);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log("Table already exists.");
    } else {
      console.error("Error creating table:", error);
    }
  }
}

createSOSTable();
