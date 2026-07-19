const fs = require('fs');
const content = fs.readFileSync('package.json', 'utf8');
const pkg = JSON.parse(content);

pkg.scripts.dev = "vite --host 0.0.0.0 --port 3000";
pkg.scripts.build = "vite build";
delete pkg.scripts.start;

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Patched package.json for pure SPA");
