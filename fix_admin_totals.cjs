const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

content = content.replace(/os\.netValue \+ \(os\.tollCost \|\| 0\) \+ \(os\.otherExpenses \|\| 0\)/g, "os.netValue");

fs.writeFileSync('src/components/Admin.tsx', content);
