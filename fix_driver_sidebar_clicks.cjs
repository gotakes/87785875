const fs = require('fs');
let content = fs.readFileSync('src/components/Driver.tsx', 'utf8');

content = content.replace(/onClick=\{\(\) => setActiveTab\('PENDING'\)\}/g, "onClick={() => { setActiveTab('PENDING'); setMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => setActiveTab\('COMPLETED'\)\}/g, "onClick={() => { setActiveTab('COMPLETED'); setMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => setActiveTab\('INFORME'\)\}/g, "onClick={() => { setActiveTab('INFORME'); setMobileMenuOpen(false); }}");

fs.writeFileSync('src/components/Driver.tsx', content);
