const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

serverCode = serverCode.replace(
  /const response = await fetch\(\`https:\/\/photon\.komoot\.io\/api\/\?q=\$\{encodeURIComponent\(query as string\)\}&limit=1\`[\s\S]*?if \(!response\.ok\) \{/g,
  `const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\$\{encodeURIComponent(query as string)\}&limit=1\`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LogisticaApp/1.0'
        }
      });
      if (!response.ok) {`
);

serverCode = serverCode.replace(
  /let result = \[\];\s*if \(data && data\.features && data\.features\.length > 0\) \{\s*const coords = data\.features\[0\]\.geometry\.coordinates; \/\/ \[lon, lat\]\s*result = \[\{ lat: coords\[1\], lon: coords\[0\] \}\];\s*\}/g,
  `let result = [];
      if (data && data.length > 0) {
        result = [{ lat: data[0].lat, lon: data[0].lon }];
      }`
);

fs.writeFileSync('server.ts', serverCode);
