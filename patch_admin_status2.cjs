const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// The edit OS status dropdown:
const editSelectRegex = /<select name="status" defaultValue=\{editingOs\.status\} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">[\s\S]*?<\/select>/;

const newSelect = `<select name="status" defaultValue={editingOs.status} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="PENDING_APPROVAL">Pendente</option>
                    <option value="APPROVED">Aprovada</option>
                    <option value="IN_TRANSIT">Em Trânsito</option>
                    <option value="COMPLETED">Concluída</option>
                  </select>`;

code = code.replace(editSelectRegex, newSelect);

fs.writeFileSync('src/components/Admin.tsx', code);
