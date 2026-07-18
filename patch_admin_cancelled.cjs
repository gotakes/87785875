const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const oldSelect = `<option value="COMPLETED">Concluída</option>
                      </select>`;
const newSelect = `<option value="COMPLETED">Concluída</option>
                        <option value="CANCELLED">Cancelada</option>
                      </select>`;

code = code.split(oldSelect).join(newSelect);

// Add to osStatusData chart
code = code.replace(
    /\{ name: 'Concluída', value: orders.filter\(o => o.status === 'COMPLETED'\).length, color: '#10b981' \}/,
    `{ name: 'Concluída', value: orders.filter(o => o.status === 'COMPLETED').length, color: '#10b981' },
    { name: 'Cancelada', value: orders.filter(o => o.status === 'CANCELLED').length, color: '#ef4444' }`
);

// Add to status badge
const badgeRegex = /os\.status === 'APPROVED' \? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'/g;
code = code.replace(badgeRegex, "os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'");

const labelRegex = /os\.status === 'APPROVED' \? 'Aprovado' : 'Pendente'/g;
code = code.replace(labelRegex, "os.status === 'APPROVED' ? 'Aprovado' : os.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'");

fs.writeFileSync('src/components/Admin.tsx', code);
