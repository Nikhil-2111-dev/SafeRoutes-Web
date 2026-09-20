
fetch("https://nominatim.openstreetmap.org/search?q=restaurant&format=json&viewbox=80.9,26.9,81.0,26.8&bounded=1&limit=10", {
  headers: { "User-Agent": "SafeRouteApp/1.0" }
}).then(r => r.json()).then(d => {
  console.log("Nominatim Restaurants:", d.map(r => r.name));
}).catch(console.error);

