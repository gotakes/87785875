const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// 1. Update updateData
code = code.replace(
  /status,\s*observations: \(form\.elements\.namedItem\('observations'\) as HTMLTextAreaElement\)\.value,\s*\};/,
  `status,
        observations: (form.elements.namedItem('observations') as HTMLTextAreaElement).value,
        kmL: parseFloat((form.elements.namedItem('kmL') as HTMLInputElement)?.value || '0'),
        dieselPrice: parseFloat((form.elements.namedItem('dieselPrice') as HTMLInputElement)?.value || '0'),
      };`
);

// 2. Add input fields to the form
const formInputs = `<div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Distância Realizada (Km)</label>`;

const newFormInputs = `<div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Consumo (Km/L)</label>
                  <input name="kmL" type="number" step="0.01" defaultValue={editingOs.kmL || 2.5} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço Diesel (R$)</label>
                  <input name="dieselPrice" type="number" step="0.01" defaultValue={editingOs.dieselPrice || 5.9} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Distância Realizada (Km)</label>`;

code = code.replace(formInputs, newFormInputs);

fs.writeFileSync('src/components/Admin.tsx', code);
