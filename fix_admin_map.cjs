const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// Add state
const stateTarget = `  const [searchClientOs, setSearchClientOs] = useState<string>('');`;
const stateReplacement = `  const [searchClientOs, setSearchClientOs] = useState<string>('');
  const [showMapMobile, setShowMapMobile] = useState(false);`;
content = content.replace(stateTarget, stateReplacement);

// Update layout
const layoutTarget = `        {activeTab === 'OS_CREATE' && (
          <div className="flex h-full animate-in fade-in duration-300 relative w-full">
            {/* Left Sidebar Form (Qualp Clone) */}
            <div className="w-[450px] bg-white h-full overflow-y-auto border-r border-slate-200 shadow-2xl z-10 flex flex-col p-6">`;
const layoutReplacement = `        {activeTab === 'OS_CREATE' && (
          <div className="flex flex-col md:flex-row h-full animate-in fade-in duration-300 relative w-full">
            {/* Mobile Toggle Buttons */}
            <div className="md:hidden flex bg-white border-b border-slate-200 shrink-0">
              <button 
                onClick={() => setShowMapMobile(false)}
                className={\`flex-1 py-3 text-sm font-bold text-center border-b-2 \${!showMapMobile ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}\`}
              >
                Formulário
              </button>
              <button 
                onClick={() => setShowMapMobile(true)}
                className={\`flex-1 py-3 text-sm font-bold text-center border-b-2 \${showMapMobile ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}\`}
              >
                Visualizar Mapa
              </button>
            </div>

            {/* Left Sidebar Form (Qualp Clone) */}
            <div className={\`\${showMapMobile ? 'hidden md:flex' : 'flex'} w-full md:w-[450px] bg-white h-full overflow-y-auto border-r border-slate-200 shadow-2xl z-10 flex-col p-4 md:p-6 shrink-0\`}>`;
content = content.replace(layoutTarget, layoutReplacement);

const mapTarget = `            {/* Right Side Map */}
            <div className="flex-1 relative bg-slate-100 h-full">`;
const mapReplacement = `            {/* Right Side Map */}
            <div className={\`\${!showMapMobile ? 'hidden md:block' : 'block'} flex-1 relative bg-slate-100 h-full\`}>`;
content = content.replace(mapTarget, mapReplacement);

fs.writeFileSync('src/components/Admin.tsx', content);
