const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const clientButton = `          <SidebarButton 
            active={activeTab === 'CLIENT_LIST'} 
            icon={<UserPlus size={20} />} 
            label="Clientes" 
            onClick={() => setActiveTab('CLIENT_LIST')} 
          />
`;

code = code.replace(
  /<SidebarButton\s*active=\{activeTab === 'DRIVER_LIST'\}/,
  clientButton + "          <SidebarButton \n            active={activeTab === 'DRIVER_LIST'}"
);

fs.writeFileSync('src/components/Admin.tsx', code);
