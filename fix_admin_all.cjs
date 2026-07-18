const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// 1. Fix DriverDetailView extra div (around 2269)
// Find the exact block in DriverDetailView
const driverDetailEndBad = `             </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}`;
const driverDetailEndGood = `             </div>
          </div>
        )}
      </div>
    </div>
  );
}`;
content = content.replace(driverDetailEndBad, driverDetailEndGood);

// 2. Fix ClientDetailView extra div (around 2436)
const clientDetailEndBad = `             </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}`;
const clientDetailEndGood = `             </div>
          </div>
        )}
      </div>
    </div>
  );
}`;
// If there are multiple extra divs, replace them:
content = content.replace(/        \)}\n        <\/div>\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n}/, `        )}\n      </div>\n    </div>\n  );\n}`);
content = content.replace(/        \)}\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n}/, `        )}\n      </div>\n    </div>\n  );\n}`);


// 3. Fix AdminPanel missing div (around 1862)
const adminPanelEndBad = `        )}

        </div>
      </div>
    </div>
  );
}`;
const adminPanelEndGood = `        )}

        </div>
      </div>
    </div>
    </div>
  );
}`;
content = content.replace(adminPanelEndBad, adminPanelEndGood);

// 4. Fix sidebar for mobile
const sidebarFind = `      {/* Sidebar */}

      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 print:hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-2">`;

const sidebarReplace = `      {/* Sidebar */}
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
        </div>
        <div className="hidden">
          <div className="flex items-center gap-3 text-white mb-2">`;

content = content.replace(sidebarFind, sidebarReplace);

fs.writeFileSync('src/components/Admin.tsx', content);
