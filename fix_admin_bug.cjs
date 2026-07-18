const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// Fix the map end for drivers
code = code.replace(
  /\)\)\n\s*\)\}\n\s*<\/tbody>/,
  "))\n                    }\n                  </tbody>"
);

// Check if there's any for orders
code = code.replace(
  /\)\)\n\s*\)\}\n\s*<\/tbody>/g,
  "))\n                    }\n                  </tbody>"
);

fs.writeFileSync('src/components/Admin.tsx', code);
