import { LocationClient, BatchUpdateDevicePositionCommand } from "@aws-sdk/client-location";

const client = new LocationClient({ region: process.env.AWS_REGION || "us-east-1" });
const TRACKER_NAME = "SafeRouteLocationTracker";

export class TrackerService {
  async updatePosition(deviceId: string, latitude: number, longitude: number) {
    try {
      const command = new BatchUpdateDevicePositionCommand({
        TrackerName: TRACKER_NAME,
        Updates: [
          {
            DeviceId: deviceId, // This should be the user's Cognito ID or email
            Position: [longitude, latitude], // AWS expects [Lng, Lat]
            SampleTime: new Date()
          }
        ]
      });
      const response = await client.send(command);
      
      if (response.Errors && response.Errors.length > 0) {
        console.warn("AWS Tracker reported errors:", response.Errors);
      }
      return { success: true };
    } catch (error) {
      console.warn("AWS Tracker Update Failed (using mock fallback):", error);
      // Fail gracefully so the frontend doesn't crash during hackathon dev
      return { success: false, fallback: true }; 
    }
  }
}
