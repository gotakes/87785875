const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// Import FinancePanel
if (!content.includes('import FinancePanel from')) {
  content = content.replace(
    "import PricingTable from './PricingTable';",
    "import PricingTable from './PricingTable';\nimport FinancePanel from './FinancePanel';"
  );
}

// Add menu item
const sidebarItem = `          <SidebarButton 
            active={activeTab === 'OS_LIST'} 
            icon={<FileText size={20} />} 
            label="Lista de OS" 
            onClick={() => { setActiveTab('OS_LIST'); setMobileMenuOpen(false); }} 
          />
          <SidebarButton 
            active={activeTab === 'FINANCE'} 
            icon={<CircleDollarSign size={20} />} 
            label="Controle Financeiro" 
            onClick={() => { setActiveTab('FINANCE'); setMobileMenuOpen(false); }} 
          />`;
content = content.replace(
  `          <SidebarButton 
            active={activeTab === 'OS_LIST'} 
            icon={<FileText size={20} />} 
            label="Lista de OS" 
            onClick={() => { setActiveTab('OS_LIST'); setMobileMenuOpen(false); }} 
          />`,
  sidebarItem
);

// Add the view block
const blockStr = `
        {activeTab === 'FINANCE' && (
          <FinancePanel orders={orders} />
        )}
        {activeTab === 'MAP' && (`;

content = content.replace(
  "        {activeTab === 'MAP' && (",
  blockStr
);

fs.writeFileSync('src/components/Admin.tsx', content);
console.log('Patched Admin.tsx for FINANCE tab');
