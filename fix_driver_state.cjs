const fs = require('fs');
let content = fs.readFileSync('src/components/Driver.tsx', 'utf8');

const targetState = `  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED' | 'INFORME'>('PENDING');`;
const replaceState = `  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED' | 'INFORME'>('PENDING');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);`;
content = content.replace(targetState, replaceState);

const sidebarFind = `      {/* Sidebar */}
      <div className="w-64 bg-emerald-900 text-emerald-100 flex flex-col shrink-0">`;
const sidebarReplace = `      {/* Sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}
      <div className={\`\${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-64 bg-emerald-900 text-emerald-100 shrink-0 fixed md:static inset-y-0 left-0 z-50 h-full\`}>`;
content = content.replace(sidebarFind, sidebarReplace);

const mainContentFind = `      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 print:hidden">`;
const mainContentReplace = `      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-display text-emerald-900">Portal do Motorista</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900 focus:outline-none">
            <Menu size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">`;
content = content.replace(mainContentFind, mainContentReplace);

const endFind = `      </div>
    </div>
  );
}`;
const endReplace = `        </div>
      </div>
    </div>
  );
}`;
content = content.replace(endFind, endReplace);

fs.writeFileSync('src/components/Driver.tsx', content);
