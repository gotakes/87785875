const fs = require('fs');
let content = fs.readFileSync('src/components/Client.tsx', 'utf8');

const mainContentFind = `      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">`;
const mainContentReplace = `      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-display text-blue-900">Portal do Cliente</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900 focus:outline-none">
            <Menu size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden relative">`;
content = content.replace(mainContentFind, mainContentReplace);

const endFind = `        </div>
      </div>
    </div>
  );
}`;
const endReplace = `        </div>
      </div>
    </div>
  );
}`;
// Wait, actually, let's just restore the end of file to have the correct number of closing divs.
// It had 2, then we added one more in main content, so now it needs 3.
content = content.replace(/      <\/div>\n    <\/div>\n  \);\n\}/g, "        </div>\n      </div>\n    </div>\n  );\n}");

fs.writeFileSync('src/components/Client.tsx', content);
