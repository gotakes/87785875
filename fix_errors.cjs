const fs = require('fs');
let file = 'src/components/Login.tsx';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes(' X ')) {
  content = content.replace("import { Truck, User, Key, ArrowRight, Upload, Phone, UserPlus, MapPin, FileText } from 'lucide-react';", "import { Truck, User, Key, ArrowRight, Upload, Phone, UserPlus, MapPin, FileText, X } from 'lucide-react';");
  fs.writeFileSync(file, content);
}

file = 'src/components/PrintFiscalModal.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace("image:        { type: 'jpeg', quality: 0.98 },", "image:        { type: 'jpeg' as const, quality: 0.98 },");
fs.writeFileSync(file, content);
