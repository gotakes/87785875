const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const driverListRowRegex = /<tr key=\{d\.id\} className="border-b border-slate-100 hover:bg-slate-50\/50 transition-colors">[\s\S]*?<\/tr>/g;
code = code.replace(driverListRowRegex, (match) => {
  return match.replace(/<td className="p-4 font-semibold text-slate-900">\{d\.name\}<\/td>/, 
    `<td className="p-4 font-semibold text-indigo-600 hover:underline cursor-pointer" onClick={() => { setSelectedDriverId(d.id); setActiveTab('DRIVER_DETAIL'); }}>{d.name}</td>`)
    .replace(/<button[\s\S]*?title="Acessar Financeiro do Motorista"[\s\S]*?<\/button>/, 
    `<button 
        onClick={() => {
          setSelectedDriverId(d.id); setActiveTab('DRIVER_DETAIL');
        }}
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      title="Acessar Cadastro/Financeiro"
    >
      <CreditCard size={18} />
    </button>`);
});

fs.writeFileSync('src/components/Admin.tsx', code);
