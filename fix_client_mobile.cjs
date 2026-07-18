const fs = require('fs');
let content = fs.readFileSync('src/components/Client.tsx', 'utf8');

// Add Menu icon import
const iconFind = `import { Map, FileText, Plus, LogOut, Minus, ArrowUpDown, CheckCircle2, MapPin, Printer } from 'lucide-react';`;
const iconAdd = `import { Menu, X, Map, FileText, Plus, LogOut, Minus, ArrowUpDown, CheckCircle2, MapPin, Printer } from 'lucide-react';`;
content = content.replace(iconFind, iconAdd);

// Add state
const stateFind = `  const [activeTab, setActiveTab] = useState<any>('OS_LIST');`;
const stateAdd = `  const [activeTab, setActiveTab] = useState<any>('OS_LIST');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);`;
content = content.replace(stateFind, stateAdd);

// Fix Sidebar
const sidebarFind = `      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 print:hidden">
        <div className="p-6 border-b border-slate-800">`;

const sidebarReplace = `      {/* SIDEBAR */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}
      <div className={\`\${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-64 bg-slate-900 text-slate-300 shrink-0 print:hidden fixed md:static inset-y-0 left-0 z-50 h-full\`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Qualp App</h2>
            <p className="text-sm font-medium text-slate-400">Portal do Cliente</p>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>`;
content = content.replace(sidebarFind, sidebarReplace);

// Update clicks on sidebar buttons
content = content.replace(/onClick=\{\(\) => setActiveTab\('([^']+)'\)\}/g, "onClick={() => { setActiveTab('$1'); setMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{onLogout\}/g, "onClick={() => { onLogout(); setMobileMenuOpen(false); }}");

// Add mobile header
const mainContentFind = `      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">`;

const mainContentReplace = `      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="font-bold text-slate-900">Portal do Cliente</div>
          <button className="text-slate-600 p-2" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto">`;

content = content.replace(mainContentFind, mainContentReplace);

// Fix main content closing div
content = content.replace(/      <\/div>\n    <\/div>\n  \);\n}/g, `        </div>\n      </div>\n    </div>\n  );\n}`);


fs.writeFileSync('src/components/Client.tsx', content);

