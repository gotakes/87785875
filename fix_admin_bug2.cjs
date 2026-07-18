const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(
  /\)\)\n\s*\}\n\s*<\/tbody>/g,
  "))\n                    }\n                  </tbody>"
);

// wait, let me check lines 1450-1460 to see what it is exactly.
