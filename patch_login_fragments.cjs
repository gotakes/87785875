const fs = require('fs');
const file = 'src/components/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'return (\n    <div className="min-h-screen bg-slate-100',
  'return (\n    <>\n    <div className="min-h-screen bg-slate-100'
);

content = content.replace(
  '      )}\n  );\n}',
  '      )}\n    </>\n  );\n}'
);

fs.writeFileSync(file, content);
console.log('Login wrapped in fragments.');
