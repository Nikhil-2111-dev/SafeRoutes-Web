import { Router } from 'express';
import { TrackerService } from '../services/tracker.service';
import { GeofenceService } from '../services/geofence.service';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const trackerService = new TrackerService();
const geofenceService = new GeofenceService();

router.post('/', requireAuth, async (req, res) => {
  const deviceId = req.user?.sub;
  const { latitude, longitude } = req.body;

  if (!deviceId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
  }

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    // 1. Update position in AWS Location Tracker
    await trackerService.updatePosition(deviceId, latitude, longitude);

    // 2. Evaluate if user entered any danger zones (Geofences)
    await geofenceService.evaluatePosition(deviceId, latitude, longitude);

    res.status(200).json({ success: true, message: 'Position updated in AWS Location Services' });
  } catch (error) {
    console.error("Tracking route error:", error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;
