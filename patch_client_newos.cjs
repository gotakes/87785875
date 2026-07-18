const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

code = code.replace(
  /createdAt\s*\};/,
  `createdAt,
        kmL: 0,
        dieselPrice: 0,
        fuelCost: 0
      };`
);

fs.writeFileSync('src/components/Client.tsx', code);
