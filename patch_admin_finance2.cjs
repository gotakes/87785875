const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const targetStr = `          <SidebarButton 
            active={activeTab === 'OS_LIST'} 
            icon={<FileArchive size={20} />} 
            label="Lista de OS" 
            onClick={() => { setActiveTab('OS_LIST'); setMobileMenuOpen(false); }} 
          />`;

const newStr = targetStr + `
          <SidebarButton 
            active={activeTab === 'FINANCE'} 
            icon={<CircleDollarSign size={20} />} 
            label="Controle Financeiro" 
            onClick={() => { setActiveTab('FINANCE'); setMobileMenuOpen(false); }} 
          />`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('src/components/Admin.tsx', content);
  console.log("Patched sidebar successfully.");
} else {
  console.log("Not found.");
}
