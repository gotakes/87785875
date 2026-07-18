const fs = require('fs');
let content = fs.readFileSync('src/components/PrintStatementModal.tsx', 'utf8');

const calculateTotalFind = `    if (isClientSide) {
      return orders.reduce((acc, os) => acc + (os.totalValue || 0), 0);
    } else {
      return orders.reduce((acc, os) => acc + ((os.netValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0)), 0);
    }`;

const calculateTotalReplace = `    if (isClientSide) {
      return orders.reduce((acc, os) => acc + (os.totalValue || 0), 0);
    } else {
      return orders.reduce((acc, os) => acc + (os.netValue || 0), 0);
    }`;

content = content.replace(calculateTotalFind, calculateTotalReplace);

const tableValFind = `const val = isClientSide ? os.totalValue : (os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0));`;
const tableValReplace = `const val = isClientSide ? os.totalValue : os.netValue;`;

content = content.replace(tableValFind, tableValReplace);

fs.writeFileSync('src/components/PrintStatementModal.tsx', content);
