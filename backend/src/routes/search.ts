import { Router } from 'express';
import { LocationClient, SearchPlaceIndexForTextCommand } from '@aws-sdk/client-location';

const router = Router();
const locationClient = new LocationClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const INDEX_NAME = 'SafeRoutePlaceIndex'; // Configured in infrastructure-stack.ts

router.post('/', async (req, res) => {
  const { query, biasPosition } = req.body; // biasPosition is optional [lng, lat]

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: INDEX_NAME,
      Text: query,
      MaxResults: 5,
      BiasPosition: biasPosition // Help provide local results
    });

    const response = await locationClient.send(command);
    
    // Format response to match frontend expectations
    const results = response.Results?.map(result => ({
      placeId: result.Place?.PlaceId || result.Place?.Label,
      label: result.Place?.Label,
      point: result.Place?.Geometry?.Point // [longitude, latitude]
    })) || [];

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('AWS Location Search error:', error);
    res.status(500).json({ success: false, error: 'Failed to search places using AWS Location Service' });
  }
});

export default router;
