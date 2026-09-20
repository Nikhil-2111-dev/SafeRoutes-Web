
const { LocationClient, SearchPlaceIndexForTextCommand } = require("@aws-sdk/client-location");
const client = new LocationClient({ region: "eu-north-1" });
async function test() {
  const command = new SearchPlaceIndexForTextCommand({
    IndexName: "SafeRoutePlaceIndex",
    Text: "restaurant",
    FilterBBox: [80.9, 26.8, 81.0, 26.9],
    MaxResults: 15
  });
  try {
    const res = await client.send(command);
    console.log(res.Results.map(r => r.Place.Label));
  } catch (e) { console.error(e); }
}
test();

