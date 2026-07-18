const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const startIdx = code.indexOf("{activeTab === 'FINANCE_DRIVERS'");
if (startIdx !== -1) {
  const endIdx = code.indexOf("{activeTab === 'PRICING_TABLE'", startIdx);
  if (endIdx !== -1) {
    code = code.substring(0, startIdx) + code.substring(endIdx);
  }
}

fs.writeFileSync('src/components/Admin.tsx', code);
