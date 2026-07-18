const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const resIdx = code.indexOf('{/* 3. RESULTADOS E TOTAIS */}');
if (resIdx !== -1) {
  const nextSectionIdx = code.indexOf('<div className="pt-6 border-t border-slate-200">', resIdx);
  if (nextSectionIdx !== -1) {
    code = code.substring(0, resIdx) + code.substring(nextSectionIdx);
    console.log("Found and removed 3. RESULTADOS E TOTAIS");
  } else {
    console.log("Could not find <div className=\"pt-6 border-t border-slate-200\">");
  }
} else {
  console.log("Could not find {/* 3. RESULTADOS E TOTAIS */}");
}

fs.writeFileSync('src/components/Client.tsx', code);
