
import { Router } from "express";
import { LocationClient, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location";

const router = Router();
const locationClient = new LocationClient({ region: process.env.AWS_REGION || "eu-north-1" });
const INDEX_NAME = "SafeRoutePlaceIndex"; // Configured in infrastructure-stack.ts

// Photon (Komoot) Geocoding fallback - Excellent for partial autocomplete!
async function searchWithPhoton(query: string, biasPosition?: [number, number]): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: "5",
      lang: "en",
      bbox: "68.1166,6.75,97.3956,35.50" // Restrict to India to avoid global results swamping the limit
    });

    if (biasPosition) {
      params.append("lon", biasPosition[0].toString());
      params.append("lat", biasPosition[1].toString());
    }

    const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();

    return (data.features || [])
      .filter((f: any) => !f.properties?.countrycode || f.properties.countrycode === 'IN' || f.properties.country === 'India')
      .map((f: any) => {
        const p = f.properties;
        const name = p.name || p.street || p.city;
        const state = p.state || p.county;
        const finalLabel = [name, name !== p.city ? p.city : null, state].filter(Boolean).join(", ");

        return {
          placeId: p.osm_id?.toString() || Math.random().toString(),
          label: finalLabel,
          point: f.geometry.coordinates, // [lng, lat]
          country: "India"
        };
      })
      .filter((res: any) => res.label.trim().length > 0);
  } catch (error) {
    console.error("Photon search failed:", error);
    return [];
  }
}

router.post("/", async (req, res) => {
  const { query, biasPosition } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: INDEX_NAME,
      Text: query,
      MaxResults: 5,
      BiasPosition: biasPosition // Help provide local results
    });

    const response = await locationClient.send(command);
    
    const results = response.Results?.map(result => ({
      placeId: result.PlaceId || result.Place?.Label,
      label: result.Place?.Label,
      point: result.Place?.Geometry?.Point // [longitude, latitude]
    })) || [];

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.warn("AWS Location Search error, falling back to Photon...", error);
    const fallbackResults = await searchWithPhoton(query, biasPosition);
    return res.status(200).json({ 
      success: true, 
      results: fallbackResults 
    });
  }
});

export default router;

