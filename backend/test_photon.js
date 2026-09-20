
fetch("https://photon.komoot.io/api/?q=starbucks&lat=26.84&lon=80.94&limit=5&lang=en")
  .then(r => r.json())
  .then(data => {
    const results = (data.features || [])
        .map(f => f.properties.name + ", " + f.properties.countrycode);
    console.log(results);
  })
  .catch(console.error);

