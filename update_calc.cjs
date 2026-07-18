const fs = require('fs');

let admin = fs.readFileSync('src/components/Admin.tsx', 'utf8');
let client = fs.readFileSync('src/components/Client.tsx', 'utf8');

// Admin calculation update
admin = admin.replace(
  /const carrierCommission = grossValue \* 0\.15;.*?\n.*const netValue = grossValue \* 0\.85;.*/g,
  `const totalValueCalc = grossValue + tollCost + otherExpenses;
                  const carrierCommission = totalValueCalc * 0.15;
                  const netValue = totalValueCalc * 0.85;`
);

// We need to pass the new fields from the form.
// Let's add them to osData.
admin = admin.replace(
  /estimatedWeight: '',/,
  `estimatedWeight: (form.elements.namedItem('estimatedWeight') as HTMLInputElement)?.value || '',
                      cargoVolume: (form.elements.namedItem('cargoVolume') as HTMLInputElement)?.value || '',`
);

// We should also replace the readOnly calculated inputs in Admin.tsx
admin = admin.replace(
  /<input name="carrierCommission" type="number" step="0\.01" readOnly value=\{osFreightValue > 0 \? \(osFreightValue \* 0\.15\)\.toFixed\(2\) : ''\}/g,
  `<input name="carrierCommission" type="number" step="0.01" readOnly value={osFreightValue > 0 ? (osTotalValue * 0.15).toFixed(2) : ''}`
);
admin = admin.replace(
  /<input name="driverPayment" type="number" step="0\.01" readOnly value=\{osFreightValue > 0 \? \(osFreightValue \* 0\.85\)\.toFixed\(2\) : ''\}/g,
  `<input name="driverPayment" type="number" step="0.01" readOnly value={osFreightValue > 0 ? (osTotalValue * 0.85).toFixed(2) : ''}`
);


// Client calculation update
client = client.replace(
  /netValue: osTotalValue \* 0\.85,\s*carrierCommission: osTotalValue \* 0\.15,/,
  `netValue: osTotalValue * 0.85,\n        carrierCommission: osTotalValue * 0.15,\n        estimatedWeight: (form.elements.namedItem('estimatedWeight') as HTMLInputElement)?.value || '',\n        cargoVolume: (form.elements.namedItem('cargoVolume') as HTMLInputElement)?.value || '',`
);

fs.writeFileSync('src/components/Admin.tsx', admin);
fs.writeFileSync('src/components/Client.tsx', client);
