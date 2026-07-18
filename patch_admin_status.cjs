const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// 1. Dashboard Chart
code = code.replace(
  /const osStatusData = \[\s*\{ name: 'Pendente', value: orders\.filter\(o => o\.status === 'PENDING'\)\.length, color: '#f59e0b' \},\s*\{ name: 'Em Trânsito', value: orders\.filter\(o => o\.status === 'IN_TRANSIT'\)\.length, color: '#6366f1' \},\s*\{ name: 'Concluída', value: orders\.filter\(o => o\.status === 'COMPLETED'\)\.length, color: '#10b981' \}\s*\];/,
  `const osStatusData = [
    { name: 'Pendente', value: orders.filter(o => o.status === 'PENDING_APPROVAL').length, color: '#f59e0b' },
    { name: 'Aprovado', value: orders.filter(o => o.status === 'APPROVED').length, color: '#a855f7' },
    { name: 'Em Trânsito', value: orders.filter(o => o.status === 'IN_TRANSIT').length, color: '#6366f1' },
    { name: 'Concluída', value: orders.filter(o => o.status === 'COMPLETED').length, color: '#10b981' }
  ];`
);

// 2. Table Span
const oldTableSpan = `<span className={\`text-xs font-semibold rounded-full px-3 py-1 \${
                            os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            os.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                          }\`}>
                            {os.status === 'COMPLETED' ? 'Concluída' : os.status === 'IN_TRANSIT' ? 'Em Trânsito' : 'Pendente'}
                          </span>`;

const newTableSpan = `<span className={\`text-xs font-semibold rounded-full px-3 py-1 \${
                            os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            os.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 
                            os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                          }\`}>
                            {os.status === 'COMPLETED' ? 'Concluída' : 
                             os.status === 'IN_TRANSIT' ? 'Em Trânsito' : 
                             os.status === 'APPROVED' ? 'Aprovado' : 'Pendente'}
                          </span>`;

code = code.split(oldTableSpan).join(newTableSpan);

// 3. Inline Select
const oldSelect = `<select
                        value={os.status}
                        onChange={async (e) => {
                          try {
                            await updateDoc(doc(db, 'orders', os.id), { status: e.target.value });
                            toast.success('Status atualizado');
                          } catch(err) {
                            toast.error('Erro ao atualizar status');
                          }
                        }}
                        className={\`text-xs font-semibold rounded-full px-2 py-1 outline-none \${
                          os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          os.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                        }\`}
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="IN_TRANSIT">Em Trânsito</option>
                        <option value="COMPLETED">Concluída</option>
                      </select>`;

const newSelect = `<select
                        value={os.status}
                        onChange={async (e) => {
                          try {
                            await updateDoc(doc(db, 'orders', os.id), { status: e.target.value });
                            toast.success('Status atualizado');
                          } catch(err) {
                            toast.error('Erro ao atualizar status');
                          }
                        }}
                        className={\`text-xs font-semibold rounded-full px-2 py-1 outline-none \${
                          os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          os.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 
                          os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                        }\`}
                      >
                        <option value="PENDING_APPROVAL">Pendente</option>
                        <option value="APPROVED">Aprovado</option>
                        <option value="IN_TRANSIT">Em Trânsito</option>
                        <option value="COMPLETED">Concluída</option>
                      </select>`;

code = code.split(oldSelect).join(newSelect);

// 4. Edit form select
const editSelectOld = `<select name="status" defaultValue={editingOs.status} className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded focus:outline-none">
                          <option value="PENDING">Pendente</option>
                          <option value="IN_TRANSIT">Em Trânsito</option>
                          <option value="COMPLETED">Concluído</option>
                        </select>`;

const editSelectNew = `<select name="status" defaultValue={editingOs.status} className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded focus:outline-none">
                          <option value="PENDING_APPROVAL">Pendente (Aguardando Aprovação)</option>
                          <option value="APPROVED">Aprovado (Aguardando Motorista)</option>
                          <option value="IN_TRANSIT">Em Trânsito</option>
                          <option value="COMPLETED">Concluído</option>
                        </select>`;

code = code.split(editSelectOld).join(editSelectNew);

fs.writeFileSync('src/components/Admin.tsx', code);
