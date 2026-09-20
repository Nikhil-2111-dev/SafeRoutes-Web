import { useState, useRef, useEffect, useCallback } from 'react';
import { getCategoryKey } from '../utils/poiIcons';

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function usePOIs(mapRef: any, isEnabled: boolean, mapLoaded: boolean) {
  const [poiGeoJson, setPoiGeoJson] = useState<any>({ type: 'FeatureCollection', features: [] });
  const [isFetchingPOIs, setIsFetchingPOIs] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchCenterRef = useRef<{ lat: number, lng: number } | null>(null);
  const fetchedIds = useRef<Set<string>>(new Set()); // Prevents duplicate features globally

  const fetchPOIs = useCallback(async () => {
    if (!mapRef.current || !isEnabled) return;
    
    const map = mapRef.current.getMap();
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    // Threshold check (50m) to avoid fetching on micro-movements
    if (lastFetchCenterRef.current) {
      const dist = calculateDistanceMeters(
        lastFetchCenterRef.current.lat, 
        lastFetchCenterRef.current.lng, 
        center.lat, 
        center.lng
      );
      if (dist < 50) return;
    }

    lastFetchCenterRef.current = center;
    const bounds = map.getBounds();
    const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

    // Cancel ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsFetchingPOIs(true);
    
    try {
      const photonCategories = ['hospital', 'police', 'bank', 'hotel', 'fuel'];
      const newFeatures: any[] = [];

      // 1. Fetch Premium Restaurants via Nominatim (Google-Maps style main locations)
      if (!abortControllerRef.current?.signal.aborted) {
        try {
          const viewbox = `${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()},${bounds.getSouth()}`;
          const nomUrl = `https://nominatim.openstreetmap.org/search?q=restaurant&format=json&viewbox=${viewbox}&bounded=1&limit=15`;
          const nomRes = await fetch(nomUrl, { 
            signal,
            headers: { 'Accept-Language': 'en' }
          });
          
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (Array.isArray(nomData)) {
              nomData.forEach((f: any) => {
                if (!f.name) return;
                const id = f.place_id?.toString() || Math.random().toString();
                if (!fetchedIds.current.has(id)) {
                  newFeatures.push({
                    type: 'Feature',
                    id,
                    geometry: { type: 'Point', coordinates: [parseFloat(f.lon), parseFloat(f.lat)] },
                    properties: {
                      id,
                      name: f.name,
                      category: 'restaurant',
                      icon: 'poi-restaurant'
                    }
                  });
                }
              });
            }
          }
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          console.warn('Nominatim failed for restaurant:', err);
        }
      }

      // 2. Fetch remaining categories via Photon
      for (const cat of photonCategories) {
        if (abortControllerRef.current?.signal.aborted) break;

        try {
          const photonUrl = `https://photon.komoot.io/api/?q=${cat}&lat=${center.lat}&lon=${center.lng}&limit=10`;
          const res = await fetch(photonUrl, { signal });
          
          if (!res.ok) continue;
          
          const data = await res.json();
          if (data.features) {
            data.features.forEach((f: any) => {
              if (!f.properties || !f.properties.name) return;
              
              const id = f.properties.osm_id?.toString() || Math.random().toString();
              if (!fetchedIds.current.has(id)) {
                // Since we explicitly queried this category, use it to map the icon
                let amenity = (cat === 'hospital' || cat === 'police' || cat === 'bank' || cat === 'fuel') ? cat : undefined;
                let tourism = cat === 'hotel' ? cat : undefined;

                const categoryKey = getCategoryKey({
                  amenity,
                  tourism,
                  name: f.properties.name
                });

                newFeatures.push({
                  type: 'Feature',
                  id,
                  geometry: f.geometry,
                  properties: {
                    id,
                    name: f.properties.name,
                    category: categoryKey,
                    icon: `poi-${categoryKey}` // Maps to map.addImage id
                  }
                });
              }
            });
          }
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          console.warn(`Photon failed for ${cat}:`, err);
        }
      }

      if (newFeatures.length > 0) {
        // Only mark them as fetched if we actually reached the state update (not aborted)
        newFeatures.forEach(f => fetchedIds.current.add(f.id));
        
        setPoiGeoJson((prev: any) => ({
          type: 'FeatureCollection',
          features: [...prev.features, ...newFeatures]
        }));
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Failed to fetch POIs:', e);
      }
    } finally {
      setIsFetchingPOIs(false);
    }
  }, [mapRef, isEnabled, mapLoaded]);

  // Hook into map move events
  useEffect(() => {
    if (!mapRef.current || !isEnabled || !mapLoaded) return;
    const map = mapRef.current.getMap();
    
    const onMoveEnd = () => fetchPOIs();
    
    map.on('moveend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
    };
  }, [mapRef, isEnabled, mapLoaded, fetchPOIs]);

  // Initial fetch
  useEffect(() => {
    if (isEnabled && mapLoaded) {
      fetchPOIs();
    }
  }, [isEnabled, mapLoaded, fetchPOIs]);

  return { poiGeoJson, isFetchingPOIs };
}
