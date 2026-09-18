import { LocationClient, BatchEvaluateGeofencesCommand, ListGeofencesCommand } from "@aws-sdk/client-location";

const client = new LocationClient({ region: process.env.AWS_REGION || "us-east-1" });
const GEOFENCE_COLLECTION = "SafeRouteDangerZones";

export class GeofenceService {
  
  // Note: Amazon Location Tracker automatically evaluates Geofences if linked,
  // but this is useful for manual evaluation or manual testing during the hackathon.
  async evaluatePosition(deviceId: string, lat: number, lng: number) {
    try {
      const command = new BatchEvaluateGeofencesCommand({
        CollectionName: GEOFENCE_COLLECTION,
        DevicePositionUpdates: [
          {
            DeviceId: deviceId,
            Position: [lng, lat],
            SampleTime: new Date()
          }
        ]
      });
      const response = await client.send(command);
      return { success: true, errors: response.Errors };
    } catch (error) {
      console.warn("AWS Geofence Evaluation Failed (using mock fallback):", error);
      return { success: false, fallback: true }; 
    }
  }

  async getDangerZones() {
    try {
      const command = new ListGeofencesCommand({
        CollectionName: GEOFENCE_COLLECTION
      });
      const response = await client.send(command);
      return response.Entries || [];
    } catch (error) {
      console.warn("Failed to list AWS Geofences, returning empty mock array.");
      return [];
    }
  }
}
