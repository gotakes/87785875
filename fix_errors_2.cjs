const fs = require('fs');

let file = 'src/components/Login.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "import { Truck, ShieldCheck, Phone, Lock, ArrowRight, UserPlus, User, FileText, Upload } from 'lucide-react';",
  "import { Truck, ShieldCheck, Phone, Lock, ArrowRight, UserPlus, User, FileText, Upload, X } from 'lucide-react';"
);
fs.writeFileSync(file, content);

file = 'src/components/PrintFiscalModal.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },",
  "jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const },"
);
fs.writeFileSync(file, content);

