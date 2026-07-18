const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// Add mobileMenuOpen state
const stateFind = `  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');`;
const stateAdd = `  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);`;
content = content.replace(stateFind, stateAdd);

// Add import Menu
const iconFind = `import { Banknote, X, ArrowDownToLine, ArrowUpFromLine, CircleDollarSign, Plus, Minus, Map, Truck, BarChart3, FileText, UserPlus, CreditCard, Route, CheckCircle2, LogOut, ArrowLeft, Download, FileArchive, Trash2, Edit, Search, MapPin, PlusCircle, Eraser, Car, Bus, Bike, ChevronDown, ChevronUp, Fuel, Calendar, ArrowUpDown, MessageCircle } from 'lucide-react';`;
const iconAdd = `import { Menu, Banknote, X, ArrowDownToLine, ArrowUpFromLine, CircleDollarSign, Plus, Minus, Map, Truck, BarChart3, FileText, UserPlus, CreditCard, Route, CheckCircle2, LogOut, ArrowLeft, Download, FileArchive, Trash2, Edit, Search, MapPin, PlusCircle, Eraser, Car, Bus, Bike, ChevronDown, ChevronUp, Fuel, Calendar, ArrowUpDown, MessageCircle } from 'lucide-react';`;
content = content.replace(iconFind, iconAdd);

// Fix Sidebar
const sidebarFind = `      {/* ================= SIDEBAR ================= */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 print:hidden">
        <div className="p-6">`;

const sidebarReplace = `      {/* ================= SIDEBAR ================= */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}
      <div className={\`\${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-64 bg-slate-900 text-slate-300 shrink-0 print:hidden fixed md:static inset-y-0 left-0 z-50 h-full\`}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 text-white mb-2">
              <Truck className="w-8 h-8 text-indigo-400" />
              <h1 className="text-xl font-bold tracking-tight font-display">El Nathan</h1>
            </div>
            <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Painel de Controle</p>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>`;
content = content.replace(sidebarFind, sidebarReplace);

// Add mobile header
const mainContentFind = `      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 overflow-auto">`;

const mainContentReplace = `      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-slate-900">El Nathan</span>
          </div>
          <button className="text-slate-600 p-2" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto">`;

content = content.replace(mainContentFind, mainContentReplace);

// Fix main content closing div
const mainContentEndFind = `      </div>
    </div>`;

const mainContentEndReplace = `        </div>
      </div>
    </div>`;
// Replace the LAST occurrence, or just safely replace if we know the structure.
// Let's use a regex to replace the end of the return statement
content = content.replace(/      <\/div>\n    <\/div>\n  \);\n}/g, `        </div>\n      </div>\n    </div>\n  );\n}`);

// Add click handler to sidebar buttons to close menu on mobile
const sidebarButtonFind = `function SidebarButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {`;
const sidebarButtonReplace = `function SidebarButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  const handleClick = () => {
    onClick();
  };`;
content = content.replace(sidebarButtonFind, sidebarButtonReplace);

fs.writeFileSync('src/components/Admin.tsx', content);

