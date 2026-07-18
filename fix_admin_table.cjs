const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

content = content.replace(/<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">\s*<table/g, '<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">\n                <table');

fs.writeFileSync('src/components/Admin.tsx', content);

