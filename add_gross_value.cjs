const fs = require('fs');
let client = fs.readFileSync('src/components/Client.tsx', 'utf8');

client = client.replace(
  /freightMinimum: osFreightValue,/,
  `freightMinimum: osFreightValue,\n        grossValue: osFreightValue,`
);

fs.writeFileSync('src/components/Client.tsx', client);
