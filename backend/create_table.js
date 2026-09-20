const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

async function createTable() {
  const command = new CreateTableCommand({
    TableName: "SafeRouteContacts",
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" },
      { AttributeName: "SK", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "PK", KeyType: "HASH" },
      { AttributeName: "SK", KeyType: "RANGE" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  try {
    console.log("Creating table SafeRouteContacts...");
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

createTable();
