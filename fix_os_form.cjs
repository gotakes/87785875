const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const carrierCommFind = `value={osFreightValue > 0 ? (osTotalValue * 0.15).toFixed(2) : ''}`;
const carrierCommReplace = `value={osFreightValue > 0 ? (osFreightValue * 0.15).toFixed(2) : ''}`;
content = content.replace(carrierCommFind, carrierCommReplace);

const driverPaymentFind = `value={osFreightValue > 0 ? (osTotalValue * 0.85).toFixed(2) : ''}`;
const driverPaymentReplace = `value={osFreightValue > 0 ? (osFreightValue * 0.85).toFixed(2) : ''}`;
content = content.replace(driverPaymentFind, driverPaymentReplace);

fs.writeFileSync('src/components/Admin.tsx', content);
