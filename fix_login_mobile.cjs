const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

// Replace overflow-hidden with overflow-x-hidden overflow-y-auto
content = content.replace(/className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden"/g, 
  'className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-x-hidden overflow-y-auto py-12"');

fs.writeFileSync('src/components/Login.tsx', content);

