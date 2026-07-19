const fs = require('fs');
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

code = code.replace(
  '<Target size={14} className="text-indigo-600 animate-pulse" title="Seguindo automaticamente" />',
  '<span title="Seguindo automaticamente"><Target size={14} className="text-indigo-600 animate-pulse" /></span>'
);

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Fixed Map.tsx");
