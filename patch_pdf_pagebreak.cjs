const fs = require('fs');

// Patch PrintStatementModal.tsx
let statementCode = fs.readFileSync('src/components/PrintStatementModal.tsx', 'utf8');
statementCode = statementCode.replace(/jsPDF:        \{ unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const \}/,
  "jsPDF:        { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const },\n      pagebreak:    { mode: ['css', 'legacy'], avoid: ['tr', 'tfoot', '.avoid-break'] }");

// Also add avoid-break class to some elements
statementCode = statementCode.replace(/<tr className="border-t-2 border-black">/, '<tr className="border-t-2 border-black avoid-break">');

fs.writeFileSync('src/components/PrintStatementModal.tsx', statementCode);

// Patch PrintOsModal.tsx
let osCode = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');
osCode = osCode.replace(/jsPDF:        \{ unit: 'in', format: 'a4', orientation: 'portrait' as const \}/,
  "jsPDF:        { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const },\n      pagebreak:    { mode: ['css', 'legacy'], avoid: ['tr', '.avoid-break', 'div.bg-slate-50'] }");

fs.writeFileSync('src/components/PrintOsModal.tsx', osCode);
