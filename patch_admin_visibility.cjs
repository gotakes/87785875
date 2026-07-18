const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// 1. Remove hover opacity from buttons
code = code.replace(/opacity-0 group-hover:opacity-100/g, 'opacity-100');

// 2. Add fuelCost recalculation
const regexUpdateData = /const updateData = \{\s*createdAt,\s*driverId,/;

code = code.replace(
  /const updateData = \{\s*createdAt,/,
  `const kmLValue = parseFloat((form.elements.namedItem('kmL') as HTMLInputElement)?.value || '0');
      const dieselPriceValue = parseFloat((form.elements.namedItem('dieselPrice') as HTMLInputElement)?.value || '0');
      const distanceKmValue = parseFloat((form.elements.namedItem('distanceKm') as HTMLInputElement).value);
      const fuelCost = kmLValue > 0 ? (distanceKmValue / kmLValue) * dieselPriceValue : 0;

      const updateData = {
        createdAt,`
);

const updateDataEndRegex = /kmL: parseFloat\(\(form\.elements\.namedItem\('kmL'\) as HTMLInputElement\)\?\.value \|\| '0'\),\s*dieselPrice: parseFloat\(\(form\.elements\.namedItem\('dieselPrice'\) as HTMLInputElement\)\?\.value \|\| '0'\),\s*\};/;

code = code.replace(
  updateDataEndRegex,
  `kmL: kmLValue,
        dieselPrice: dieselPriceValue,
        fuelCost,
      };`
);


fs.writeFileSync('src/components/Admin.tsx', code);
