import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { PinService } from '../services/pin.service';
import { AIService } from '../services/ai.service';

const router = Router();
const pinService = new PinService();
const aiService = new AIService();

// GET /api/v1/pins - Fetch all active pins (can be public or authenticated, keeping it authenticated for safety)
router.get('/', requireAuth, async (req, res) => {
  try {
    const pins = await pinService.getAllActivePins();
    res.status(200).json(pins);
  } catch (error) {
    console.error("Error fetching pins:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/v1/pins - Create a new pin
router.post('/', requireAuth, async (req, res) => {
  const userId = req.user?.sub;
  const { type, description, latitude, longitude, tags } = req.body;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!latitude || !longitude || !type || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newPin = await pinService.createPin({
      userId,
      type,
      description,
      latitude,
      longitude,
      tags
    });
    res.status(201).json(newPin);
  } catch (error) {
    console.error("Error creating pin:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/v1/pins/analyze-image - Analyze image using Gemini
router.post('/analyze-image', requireAuth, async (req, res) => {
  // Increase the payload size limit for this specific route if needed, or rely on express body parser configuration in app.ts
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    // Strip prefix if present (e.g. data:image/jpeg;base64,)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    const analysis = await aiService.analyzeIncidentImage(base64Data, mimeType || 'image/jpeg');
    res.status(200).json(analysis);
  } catch (error) {
    console.error("Error in analyze-image route:", error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
