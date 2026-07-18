const fs = require('fs');

let client = fs.readFileSync('src/components/Client.tsx', 'utf8');

// Set isRoundTrip to true by default
client = client.replace(
  /const \[routeParams, setRouteParams\] = useState\(\{ dieselPrice: 5\.90, kmL: 2\.5, isRoundTrip: false \}\);/,
  'const [routeParams, setRouteParams] = useState({ dieselPrice: 5.90, kmL: 2.5, isRoundTrip: true });'
);

// Remove the checkbox
client = client.replace(
  /<label className="flex items-center gap-2 mt-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors border border-transparent">[\s\S]*?<\/label>/,
  ''
);

fs.writeFileSync('src/components/Client.tsx', client);
