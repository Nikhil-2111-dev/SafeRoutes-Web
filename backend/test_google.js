
const key = "AIzaSyAGjv9P7VcJ60U9DXd0FyhGk7IbY9ikjWY";
fetch(`https://places.googleapis.com/v1/places:autocomplete`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": key
  },
  body: JSON.stringify({ input: "Starbucks", includedRegionCodes: ["IN"] })
}).then(r => r.json()).then(console.log).catch(console.error);

