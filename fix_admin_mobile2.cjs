const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

content = content.replace(/<SidebarButton\s+active={activeTab === '([^']+)'}\s+icon={([^}]+)}\s+label="([^"]+)"\s+onClick={\(\) => setActiveTab\('([^']+)'\)}\s+\/>/g, 
  "<SidebarButton active={activeTab === '$1'} icon={$2} label=\"$3\" onClick={() => { setActiveTab('$4'); setMobileMenuOpen(false); }} />");

fs.writeFileSync('src/components/Admin.tsx', content);
