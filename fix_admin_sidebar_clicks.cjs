const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

content = content.replace(/onClick=\{\(\) => setActiveTab\('DASHBOARD'\)\}/g, "onClick={() => { setActiveTab('DASHBOARD'); setMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => setActiveTab\('OS_CREATE'\)\}/g, "onClick={() => { setActiveTab('OS_CREATE'); setMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => setActiveTab\('OS_LIST'\)\}/g, "onClick={() => { setActiveTab('OS_LIST'); setMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => setActiveTab\('CLIENT_LIST'\)\}/g, "onClick={() => { setActiveTab('CLIENT_LIST'); setMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => setActiveTab\('DRIVER_LIST'\)\}/g, "onClick={() => { setActiveTab('DRIVER_LIST'); setMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => setActiveTab\('MAP'\)\}/g, "onClick={() => { setActiveTab('MAP'); setMobileMenuOpen(false); }}");

fs.writeFileSync('src/components/Admin.tsx', content);
