const fs = require('fs');
const file = 'src/components/Client.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("const [activeTab, setActiveTab] = useState<'OS' | 'MAP' | 'ACCOUNT' | 'FINANCE'>('OS');", 
`const [activeTab, setActiveTab] = useState<'OS' | 'MAP' | 'ACCOUNT' | 'FINANCE'>('OS');
  const [osStatusFilter, setOsStatusFilter] = useState('');
  const [osDateFrom, setOsDateFrom] = useState('');
  const [osDateTo, setOsDateTo] = useState('');
  const [osSearch, setOsSearch] = useState('');`);

const filterLogic = `
  const filteredClientOrders = clientOrders.filter(os => {
    let match = true;
    if (osStatusFilter && os.status !== osStatusFilter) match = false;
    
    if (osDateFrom || osDateTo) {
      const osDate = new Date(os.createdAt);
      if (osDateFrom) {
         const from = new Date(osDateFrom + 'T00:00:00');
         if (osDate < from) match = false;
      }
      if (osDateTo) {
         const to = new Date(osDateTo + 'T23:59:59');
         if (osDate > to) match = false;
      }
    }
    
    if (osSearch) {
      const s = osSearch.toLowerCase();
      match = match && (
        (os.number && os.number.toLowerCase().includes(s)) ||
        (os.driverPlate && os.driverPlate.toLowerCase().includes(s)) ||
        (os.status && os.status.toLowerCase().includes(s))
      );
    }
    return match;
  });
`;

content = content.replace("const clientOrders = orders.filter(o => o.clientId === client.id);", 
`const clientOrders = orders.filter(o => o.clientId === client.id);${filterLogic}`);

const searchUI = `
            <div className="flex flex-col md:flex-row gap-2 mb-6 items-start md:items-center w-full">
              <select 
                value={osStatusFilter}
                onChange={(e) => setOsStatusFilter(e.target.value)}
                className="w-full md:w-40 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700"
              >
                <option value="">Todos Status</option>
                <option value="PENDING_APPROVAL">Pendente</option>
                <option value="APPROVED">Aprovada</option>
                <option value="IN_TRANSIT">Em Trânsito</option>
                <option value="COMPLETED">Finalizada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
              <input 
                type="date"
                value={osDateFrom}
                onChange={(e) => setOsDateFrom(e.target.value)}
                className="w-full md:w-36 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700"
              />
              <input 
                type="date"
                value={osDateTo}
                onChange={(e) => setOsDateTo(e.target.value)}
                className="w-full md:w-36 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700"
              />
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Nº OS ou Placa..."
                  value={osSearch}
                  onChange={(e) => setOsSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>
`;

// Insert searchUI before table
content = content.replace('<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">', searchUI + '\n            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">');

// Update map loop
content = content.replace('{clientOrders.length === 0 ? (', '{filteredClientOrders.length === 0 ? (');
content = content.replace(') : clientOrders.map(os => (', ') : filteredClientOrders.map(os => (');

fs.writeFileSync(file, content);
console.log('Client filters patched.');
