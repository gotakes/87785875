const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /className="flex justify-center -my-2 relative z-10"/g,
    'className="flex justify-center -my-2 relative z-10 pointer-events-none"'
  );
  
  code = code.replace(
    /className="bg-white border border-slate-200 p-1\.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors"/g,
    'className="bg-white border border-slate-200 p-1.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors pointer-events-auto"'
  );

  fs.writeFileSync(file, code);
}

fixFile('src/components/Client.tsx');
fixFile('src/components/Admin.tsx');
