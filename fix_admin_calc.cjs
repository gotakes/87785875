const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// 1. Fix the calculation
const calcFind = `                  const carrierCommission = (totalValueCalcCents * 15) / 10000;
                  const netValue = (totalValueCalcCents * 85) / 10000;`;
const calcReplace = `                  const carrierCommission = (grossValueCents * 15) / 10000;
                  const netValue = (grossValueCents * 85) / 10000;`;

content = content.replace(calcFind, calcReplace);

// 2. Fix the Driver's Statement total display in Admin
const statementTotalFind = `{formatBRL(driverOrders.filter(o => selectedOsIds[o.id!]).reduce((acc, os) => acc + (os.netValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0), 0))}`;
const statementTotalReplace = `{formatBRL(driverOrders.filter(o => selectedOsIds[o.id!]).reduce((acc, os) => acc + (os.netValue || 0), 0))}`;
content = content.replace(statementTotalFind, statementTotalReplace);

fs.writeFileSync('src/components/Admin.tsx', content);
