const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const regex = /const status = \(form\.elements\.namedItem\('status'\) as HTMLSelectElement\)\.value;\s*const observations/g;

code = code.replace(
  /const updateData = \{\s*createdAt,\s*driverId,\s*driverName,\s*distanceKm[\s\S]*?status: \(form\.elements\.namedItem\('status'\) as HTMLSelectElement\)\.value,\s*observations: \(form\.elements\.namedItem\('observations'\) as HTMLTextAreaElement\)\.value,\s*\};/g,
  `
      let status = (form.elements.namedItem('status') as HTMLSelectElement).value;
      if (driverId && editingOs.status === 'PENDING_APPROVAL' && status === 'PENDING_APPROVAL') {
          status = 'APPROVED';
      }

      const updateData = {
        createdAt,
        driverId,
        driverName,
        distanceKm: parseFloat((form.elements.namedItem('distanceKm') as HTMLInputElement).value),
        grossValue: parseFloat((form.elements.namedItem('grossValue') as HTMLInputElement).value),
        carrierCommission: parseFloat((form.elements.namedItem('carrierCommission') as HTMLInputElement)?.value || '0'),
        netValue: parseFloat((form.elements.namedItem('netValue') as HTMLInputElement).value),
        tollCost: parseFloat((form.elements.namedItem('tollCost') as HTMLInputElement).value),
        otherExpenses: parseFloat((form.elements.namedItem('otherExpenses') as HTMLInputElement)?.value || '0'),
        origin: (form.elements.namedItem('origin') as HTMLInputElement).value,
        status,
        observations: (form.elements.namedItem('observations') as HTMLTextAreaElement).value,
      };`
);

fs.writeFileSync('src/components/Admin.tsx', code);
