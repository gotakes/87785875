const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/        \)\}\}\n        \{activeTab === 'PRICING_TABLE'/g, "        )}\n        {activeTab === 'PRICING_TABLE'");
content = content.replace(/        \)\}\}\n        \{activeTab === 'DRIVER_LIST'/g, "        )}\n        {activeTab === 'DRIVER_LIST'");
content = content.replace(/        \)\}\}\n        \{activeTab === 'DRIVER_DETAIL'/g, "        )}\n        {activeTab === 'DRIVER_DETAIL'");

fs.writeFileSync(filepath, content);
console.log("Fixed syntax");
