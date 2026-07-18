const fs = require('fs');

let content = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');

// Logo size
content = content.replace(/className="h-28 w-auto object-contain"/, 'className="h-20 print:h-14 w-auto object-contain"');

// Header margins
content = content.replace(/border-b-2 border-blue-900 pb-4 mb-4/, 'border-b-2 border-blue-900 pb-2 mb-2 print:pb-1 print:mb-1');

// Change standard mb-4 to print:mb-1
content = content.replace(/mb-4 border border-blue-900/g, 'mb-4 print:mb-1 border border-blue-900');
content = content.replace(/mb-8 border border-blue-900/g, 'mb-4 print:mb-1 border border-blue-900');
content = content.replace(/mt-8 border border-blue-900 print:break-before-page/g, 'mt-4 print:mt-2 border border-blue-900 print:break-before-page');

// Scale down text inside sections
content = content.replace(/text-xs/g, 'text-xs print:text-[10px] leading-tight');
content = content.replace(/text-lg/g, 'text-base print:text-sm');
content = content.replace(/text-xl/g, 'text-lg print:text-base');
content = content.replace(/text-3xl/g, 'text-2xl print:text-lg');
content = content.replace(/text-sm/g, 'text-sm print:text-xs');

// Reduce padding inside cells
content = content.replace(/className="p-2"/g, 'className="p-2 print:p-1"');
content = content.replace(/className="p-2 bg-emerald-50"/g, 'className="p-2 print:p-1 bg-emerald-50"');
content = content.replace(/className="p-2 bg-gray-100"/g, 'className="p-2 print:p-1 bg-gray-100"');
content = content.replace(/className="p-2 text-center"/g, 'className="p-2 print:p-1 text-center"');
content = content.replace(/className={\`p-2 \$\{userRole/g, 'className={`p-2 print:p-1 ${userRole');
content = content.replace(/className="p-2 text-xs space-y-1 font-medium text-gray-700"/g, 'className="p-2 print:p-1 text-xs print:text-[10px] space-y-1 font-medium text-gray-700 leading-tight"');

// Also the PDF generation needs to be adjusted, maybe we don't need to change `window.print` behavior, but just css.
fs.writeFileSync('src/components/PrintOsModal.tsx', content);

