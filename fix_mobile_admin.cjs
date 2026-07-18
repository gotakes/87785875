const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const target = `      {/* Main Content Area */}
      <div className={\`flex-1 overflow-y-auto bg-slate-50 print:hidden \${activeTab === 'OS_CREATE' ? 'p-0' : 'p-8'}\`}>`;

const replacement = `      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 print:hidden h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg font-bold font-display text-slate-900">El Nathan</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900 focus:outline-none">
            <Menu size={24} />
          </button>
        </div>
        
        <div className={\`flex-1 overflow-y-auto \${activeTab === 'OS_CREATE' ? 'p-0' : 'p-4 md:p-8'}\`}>`;

content = content.replace(target, replacement);

// We also need to add a closing div for the new wrapper. Let's find the end of the component.
const endTarget = `      </div>
    </div>
  );
}`;
const endReplacement = `        </div>
      </div>
    </div>
  );
}`;
content = content.replace(endTarget, endReplacement);
fs.writeFileSync('src/components/Admin.tsx', content);
