const fs = require('fs');
let code = fs.readFileSync('src/components/Driver.tsx', 'utf8');

code = code.replace(
  /const pendingOrders = orders\.filter\(o => o\.status === 'IN_TRANSIT'\)\.sort/g,
  `const pendingOrders = orders.filter(o => o.status !== 'COMPLETED').sort`
);

fs.writeFileSync('src/components/Driver.tsx', code);
