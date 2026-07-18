const fs = require('fs');
let content = fs.readFileSync('src/components/Driver.tsx', 'utf8');

content = content.replace(/os\.netValue \+ \(os\.tollCost \|\| 0\) \+ \(os\.otherExpenses \|\| 0\)/g, "os.netValue");

fs.writeFileSync('src/components/Driver.tsx', content);
