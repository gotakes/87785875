const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

if (!content.includes('process.env.GOOGLE_MAPS_PLATFORM_KEY')) {
  content = content.replace(
    'resolve: {',
    "define: { 'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '') },\n    resolve: {"
  );
  fs.writeFileSync('vite.config.ts', content);
  console.log("Patched vite config");
}
