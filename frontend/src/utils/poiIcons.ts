// Beautiful, minimalist black-and-white icons mirroring the Lucide style
// Each path is designed for a 24x24 viewBox.

export const POI_SVG_PATHS: Record<string, string> = {
  restaurant: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>', // Utensils
  cafe: '<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z M6 2v3 M10 2v3 M14 2v3"/>', // Coffee
  temple: '<path d="M3 22h18M12 2v7M9 2h6M12 9l-7 4h14l-7-4ZM5 22v-9M19 22v-9M9 22v-4a3 3 0 0 1 6 0v4"/>', // Landmark / Shrine
  hospital: '<path d="M12 6v4m-2-2h4m-8 6h12m-6-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>', // Hospital box
  pharmacy: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7ZM8.5 8.5l7 7"/>', // Pill
  hotel: '<path d="M10 22v-6.57M12 11h.01M12 7h.01M14 15.43V22M15 11h.01M15 7h.01M16 22l5-5.11a2 2 0 0 0 0-2.83l-3-3a2 2 0 0 0-2.83 0L14 12.17M16 22V11M2 22V11M4 22l-1.39-1.39a2 2 0 0 1 0-2.83l3-3a2 2 0 0 1 2.83 0L10 12.17M8 11h.01M8 7h.01M9 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4"/>',
  shopping: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18 M16 10a4 4 0 0 1-8 0"/>', // Shopping Bag
  bank: '<path d="M3 22h18M12 2L3 7h18L12 2ZM5 22v-9M19 22v-9M9 22v-4a3 3 0 0 1 6 0v4"/>', // Landmark
  atm: '<rect width="16" height="12" x="4" y="8" rx="2"/><path d="M8 4h8M12 4v4M9 12h.01M15 12h.01M12 16v.01"/>', // CreditCard / machine
  petrol: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>', // Fuel
  police: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', // Shield
  school: '<path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5"/>', // GraduationCap
  park: '<path d="M12 10V22M8 14h8M12 10c-3 0-5-2.5-5-5a5 5 0 0 1 10 0c0 2.5-2 5-5 5Z"/>', // Trees / Tree
  airport: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6.5 4.5L7.5 15 4.2 14.8c-.4 0-.8.3-.9.7L3 17l4.5 2 2 4.5.5-1.5c.3-.4.7-.9.7-1.3L10.5 16l2.5 2 1.8 8.2c.4.2.7.5 1.1.5L17 25l1.8-8.2"/>', // Plane
  railway: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M9 15v6M15 15v6M16 7h.01M8 7h.01M12 3v12M3 15a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/>', // Train
  bus_station: '<path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3M4 19v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1M14 19v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1"/>', // Bus
  tourist: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>', // Camera
  default: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>', // MapPin
};

export function generateSvgDataUri(category: string): string {
  const innerPath = POI_SVG_PATHS[category] || POI_SVG_PATHS.default;
  
  // Category specific colors for Google Maps style
  let fillColor = '#EA4335'; // Default Red
  let strokeColor = '#C5221F';
  
  if (category === 'restaurant' || category === 'cafe') {
    fillColor = '#FF9E67'; strokeColor = '#E67C45';
  } else if (category === 'hospital' || category === 'pharmacy') {
    fillColor = '#FF5252'; strokeColor = '#D32F2F';
  } else if (category === 'shopping') {
    fillColor = '#4B96F3'; strokeColor = '#1976D2';
  } else if (category === 'bank' || category === 'atm') {
    fillColor = '#5C6BC0'; strokeColor = '#3949AB';
  } else if (category === 'police') {
    fillColor = '#546E7A'; strokeColor = '#37474F';
  } else if (category === 'school' || category === 'university') {
    fillColor = '#8D6E63'; strokeColor = '#5D4037';
  } else if (category === 'park') {
    fillColor = '#4CB050'; strokeColor = '#388E3C';
  } else if (category === 'airport' || category === 'railway' || category === 'bus_station') {
    fillColor = '#00B0FF'; strokeColor = '#0091EA';
  } else if (category === 'hotel') {
    fillColor = '#F06292'; strokeColor = '#C2185B';
  } else if (category === 'temple') {
    fillColor = '#FFB300'; strokeColor = '#F57C00';
  }

  // Teardrop pin path: M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z
  // We'll scale it to fit a 40x40 canvas, centering it nicely.
  // The teardrop bounds are approx X: 5 to 19 (width 14), Y: 2 to 22 (height 20)
  // Let's translate and scale the pin by 1.5x
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/>
        </filter>
      </defs>
      <!-- Teardrop pin -->
      <g transform="translate(6, 4) scale(1.15)" filter="url(#shadow)">
        <path 
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
          fill="${fillColor}" 
          stroke="${strokeColor}" 
          stroke-width="1"
        />
        <!-- Inner white circle background for the icon -->
        <circle cx="12" cy="9" r="5.5" fill="${strokeColor}"/>
        <!-- The icon itself, scaled down to fit in the pin -->
        <g transform="translate(7.5, 4.5) scale(0.375)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            ${innerPath}
          </svg>
        </g>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export function loadPOIIcons(map: any) {
  Object.keys(POI_SVG_PATHS).forEach((category) => {
    // Check if map already has the image to avoid errors on fast hot-reloads
    if (!map.hasImage(`poi-${category}`)) {
      const img = new Image(40, 40);
      img.onload = () => {
        if (map && map.addImage && !map.hasImage(`poi-${category}`)) {
          map.addImage(`poi-${category}`, img, { sdf: false });
        }
      };
      img.src = generateSvgDataUri(category);
    }
  });
}

// Maps standard OSM/Photon categories to our icon keys
export function getCategoryKey(tags: any): string {
  if (!tags) return 'default';
  
  const amenity = tags.amenity;
  const leisure = tags.leisure;
  const tourism = tags.tourism;
  const shop = tags.shop;

  if (amenity === 'hospital' || amenity === 'clinic') return 'hospital';
  if (amenity === 'police') return 'police';
  if (amenity === 'bank') return 'bank';
  if (amenity === 'atm') return 'atm';
  if (amenity === 'pharmacy') return 'pharmacy';
  if (amenity === 'cafe') return 'cafe';
  if (amenity === 'restaurant' || amenity === 'fast_food') return 'restaurant';
  if (amenity === 'bar' || amenity === 'pub') return 'restaurant'; // fallback to restaurant style
  if (amenity === 'fuel') return 'petrol';
  if (amenity === 'school' || amenity === 'university' || amenity === 'college') return 'school';
  if (leisure === 'park' || leisure === 'playground' || leisure === 'nature_reserve') return 'park';
  if (tourism === 'hotel' || tourism === 'motel' || tourism === 'guest_house') return 'hotel';
  if (tourism === 'museum' || tourism === 'attraction' || tourism === 'viewpoint') return 'tourist';
  if (shop) return 'shopping';
  
  // Custom categories sometimes added
  if (tags.aeroway === 'aerodrome' || tags.aeroway === 'terminal') return 'airport';
  if (tags.railway === 'station') return 'railway';
  if (amenity === 'bus_station' || tags.highway === 'bus_stop') return 'bus_station';
  if (amenity === 'place_of_worship') return 'temple';

  return 'default';
}
