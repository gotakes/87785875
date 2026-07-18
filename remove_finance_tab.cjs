const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// remove FINANCE from SidebarButton list
const sidebarFinanceRegex = /<SidebarButton \n\s*active=\{activeTab === 'FINANCE'\} \n\s*icon=\{<Banknote size=\{20\} \/>\} \n\s*label="Financeiro" \n\s*onClick=\{\(\) => setActiveTab\('FINANCE'\)\} \n\s*\/>/g;
code = code.replace(sidebarFinanceRegex, "");

// remove FINANCE component render
const financeRenderRegex = /\{activeTab === 'FINANCE' && \([\s\S]*?\{\/\* ================= PRINT LAYOUT ================= \*\/\}/g;
code = code.replace(financeRenderRegex, "{/* ================= PRINT LAYOUT ================= */}");

fs.writeFileSync('src/components/Admin.tsx', code);
