import re

def rewrite():
    path = r'c:\SafeRoute\frontend\src\components\MapComponent.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove fetchPOIs and old hooks
    # Find start of fetchPOIs
    fetch_start = content.find("const fetchPOIs = useCallback(async () => {")
    if fetch_start != -1:
        # Find end of onMapMoveEnd block
        fetch_end = content.find("const locateMe = useCallback(() => {")
        if fetch_end != -1:
            content = content[:fetch_start] + content[fetch_end:]

    # 2. Add onLoad={onMapLoad} to <Map>
    map_tag = "<Map"
    map_idx = content.find(map_tag)
    if map_idx != -1:
        # Check if onLoad is there
        if "onLoad={" not in content[map_idx:map_idx+200]:
            content = content.replace("<Map\n", "<Map\n        onLoad={(e) => loadPOIIcons(e.target)}\n        onMouseMove={onMouseMove}\n        onMouseLeave={onMouseLeave}\n")
    
    # 3. Remove onMoveEnd={onMapMoveEnd}
    content = content.replace("onMoveEnd={onMapMoveEnd}\n", "")

    # 4. Replace <Marker> rendering for POIs
    # The old block looks like:
    # {/* POI Markers */}
    # {showPOIs && pois.map(poi => { ... return ( <Marker ...> ... </Marker> ); })}
    
    poi_marker_start = content.find("{/* POI Markers */}")
    if poi_marker_start != -1:
        poi_marker_end = content.find("{/* Origin Location Marker */}")
        if poi_marker_end != -1:
            new_poi_layers = """{/* Native POI Layers */}
        {showPOIs && poiGeoJson.features.length > 0 && (
          <Source id="pois-source" type="geojson" data={poiGeoJson} cluster={true} clusterMaxZoom={14} clusterRadius={40}>
            {/* Clustered circles */}
            <Layer 
              id="poi-clusters" 
              type="circle" 
              filter={['has', 'point_count']}
              paint={{
                'circle-color': '#ffffff',
                'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 50, 24],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#000000'
              }}
            />
            {/* Cluster count text */}
            <Layer 
              id="poi-cluster-count" 
              type="symbol" 
              filter={['has', 'point_count']}
              layout={{
                'text-field': '{point_count_abbreviated}',
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12
              }}
              paint={{
                'text-color': '#000000'
              }}
            />
            {/* Unclustered individual POI icons */}
            <Layer 
              id="poi-unclustered" 
              type="symbol" 
              filter={['!', ['has', 'point_count']]}
              layout={{
                'icon-image': ['get', 'icon'],
                'icon-size': ['case', ['boolean', ['feature-state', 'hover'], False], 1.1, 1],
                'icon-allow-overlap': true,
                'text-field': '',
              }}
            />
          </Source>
        )}

        """
            content = content[:poi_marker_start] + new_poi_layers + content[poi_marker_end:]

    # 5. Add handlers for onMouseMove and onMouseLeave
    # We add them right before onMapClick
    map_click_idx = content.find("const onMapClick = useCallback((e: any) => {")
    if map_click_idx != -1:
        handlers = """
  const onMouseMove = useCallback((e: any) => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    
    // Check POI layer
    const features = map.queryRenderedFeatures(e.point, { layers: ['poi-unclustered'] });
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';
      const feature = features[0];
      setHoveredPoi({
        id: feature.properties.id,
        name: feature.properties.name,
        x: e.point.x,
        y: e.point.y
      });
    } else {
      setHoveredPoi(null);
      // Reset cursor only if not hovering incident
      const incidentFeatures = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
      if (incidentFeatures.length === 0) {
         map.getCanvas().style.cursor = '';
      }
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.getMap().getCanvas().style.cursor = '';
    }
    setHoveredPoi(null);
  }, []);
  
"""
        content = content[:map_click_idx] + handlers + content[map_click_idx:]

    # 6. Add Hovered POI Tooltip Overlay (before the final closing div)
    # Search for the end of the Map component block: </Map>
    map_close_idx = content.find("</Map>")
    if map_close_idx != -1:
        tooltip = """
      {hoveredPoi && (
        <div 
          className="absolute pointer-events-none z-50 bg-black text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg whitespace-nowrap transition-opacity duration-150 border border-white/20"
          style={{ left: hoveredPoi.x, top: hoveredPoi.y - 45, transform: 'translateX(-50%)' }}
        >
          {hoveredPoi.name}
        </div>
      )}
"""
        content = content[:map_close_idx + 6] + tooltip + content[map_close_idx + 6:]

    # 7. Add POI selection logic to onMapClick
    poi_click_logic = """
    const poiFeature = e.features && e.features.find((f: any) => f.layer.id === 'poi-unclustered');
    if (poiFeature) {
      setSelectedPoi({
        id: poiFeature.properties.id,
        name: poiFeature.properties.name,
        category: poiFeature.properties.category,
        lat: poiFeature.geometry.coordinates[1],
        lon: poiFeature.geometry.coordinates[0]
      });
      return;
    }
"""
    # Insert it inside onMapClick
    if map_click_idx != -1:
        incident_click_idx = content.find("const incidentFeature = e.features && e.features.find((f: any) => f.layer.id === 'unclustered-point');")
        if incident_click_idx != -1:
            content = content[:incident_click_idx] + poi_click_logic + content[incident_click_idx:]

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Done phase 2 replacements.')

rewrite()
