const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldRoute = `  // Geocoding Proxy to avoid browser CORS/User-Agent restrictions
  app.get("/api/geocode", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

    try {
      // Using Photon by Komoot as it's more lenient with rate limits than Nominatim
      const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query as string)}&limit=1\`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LogisticaApp/1.0'
        }
      });
      if (!response.ok) {
        throw new Error(\`Photon error: \${response.status} \${response.statusText}\`);
      }
      const data = await response.json();
      
      // Map Photon response to Nominatim-like response for compatibility
      let result = [];
      if (data && data.length > 0) {
        result = [{ lat: data[0].lat, lon: data[0].lon }];
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("Geocoding proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch geocoding data" });
    }
  });`;

const newRoute = `  // Geocoding Proxy to avoid browser CORS/User-Agent restrictions
  app.get("/api/geocode", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

    try {
      let result = [];
      const gmpKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;
      
      if (gmpKey) {
        // Use Google Maps Geocoding API
        const gmpRes = await fetch(\`https://maps.googleapis.com/maps/api/geocode/json?address=\${encodeURIComponent(query as string)}&region=br&key=\${gmpKey}\`);
        const gmpData = await gmpRes.json();
        
        if (gmpData.status === 'OK' && gmpData.results.length > 0) {
          result = [{ 
            lat: gmpData.results[0].geometry.location.lat.toString(), 
            lon: gmpData.results[0].geometry.location.lng.toString() 
          }];
        } else {
           console.log("Google Maps geocode fail/empty:", gmpData.status);
        }
      } 
      
      // Fallback if no key or no results
      if (result.length === 0) {
        const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query as string)}&limit=1\`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LogisticaApp/1.0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            result = [{ lat: data[0].lat, lon: data[0].lon }];
          }
        }
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("Geocoding proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch geocoding data" });
    }
  });`;

if (content.includes('// Geocoding Proxy to avoid browser CORS/User-Agent restrictions')) {
  fs.writeFileSync('server.ts', content.replace(oldRoute, newRoute));
  console.log("Patched server.ts");
} else {
  console.log("Could not find route in server.ts");
}
