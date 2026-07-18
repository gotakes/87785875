const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

if (!code.includes("type Tab = 'DASHBOARD' | 'MAP' | 'OS_CREATE' | 'OS_LIST' | 'DRIVER_LIST' | 'CLIENT_LIST' | 'DRIVER_DETAIL' | 'CLIENT_DETAIL' | 'FINANCE' | 'PRICING_TABLE';")) {
  code = code.replace(/type Tab = 'DASHBOARD' \| 'MAP' \| 'OS_CREATE' \| 'OS_LIST' \| 'DRIVER_LIST' \| 'CLIENT_LIST' \| 'DRIVER_DETAIL' \| 'FINANCE_DRIVERS' \| 'FINANCE_CLIENTS' \| 'FINANCE' \| 'PRICING_TABLE';/,
    "type Tab = 'DASHBOARD' | 'MAP' | 'OS_CREATE' | 'OS_LIST' | 'DRIVER_LIST' | 'CLIENT_LIST' | 'DRIVER_DETAIL' | 'CLIENT_DETAIL' | 'FINANCE' | 'PRICING_TABLE';");
}

code = code.replace(/const \[selectedDriverId, setSelectedDriverId\] = useState<string \| null>\(null\);/,
  "const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);\n  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);");

code = code.replace(/\{activeTab === 'CLIENT_DETAIL' && selectedClientId && \([\s\S]*?\}\) \}\)/, "");

const clientDetailComponent = `
        {activeTab === 'CLIENT_DETAIL' && selectedClientId && (
          <ClientDetailView 
            clientId={selectedClientId} 
            clients={clients} 
            orders={orders} 
            onBack={() => {
              setSelectedClientId(null);
              setActiveTab('CLIENT_LIST');
            }} 
            onGenerateStatement={(selectedOses, targetName, targetDocument) => {
              setStatementData({
                 orders: selectedOses,
                 role: 'ADMIN_TO_CLIENT',
                 targetName,
                 targetDocument
              });
            }}
          />
        )}
`;

code = code.replace(/\{activeTab === 'CLIENT_LIST' && \(/, clientDetailComponent + "\n        {activeTab === 'CLIENT_LIST' && (");

const clientListRowRegex = /<tr key=\{c\.id\} className="border-b border-slate-100 hover:bg-slate-50\/50 transition-colors">[\s\S]*?<\/tr>/g;
code = code.replace(clientListRowRegex, (match) => {
  return match.replace(/<td className="p-4 font-semibold text-slate-900">\{c\.name\}<\/td>/, 
    `<td className="p-4 font-semibold text-indigo-600 hover:underline cursor-pointer" onClick={() => { setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL'); }}>{c.name}</td>`)
    .replace(/<button[\s\S]*?title="Acessar Financeiro do Cliente"[\s\S]*?<\/button>/, 
    `<button 
        onClick={() => {
          setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL');
        }}
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      title="Acessar Cadastro/Financeiro"
    >
      <CreditCard size={18} />
    </button>`);
});

fs.writeFileSync('src/components/Admin.tsx', code);
