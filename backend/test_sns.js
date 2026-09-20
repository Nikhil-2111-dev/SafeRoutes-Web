const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
require('dotenv').config();

async function testSNS() {
  const snsClient = new SNSClient({ region: "us-east-1" });
  
  try {
    console.log("Sending SMS to +916309336351 in us-east-1...");
    const res = await snsClient.send(new PublishCommand({
      PhoneNumber: "+916309336351",
      Message: "Test SMS from SafeRoute",
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' }
      }
    }));
    console.log("Success:", res);
  } catch (err) {
    console.error("us-east-1 Error:", err.message);
  }
}

testSNS();
