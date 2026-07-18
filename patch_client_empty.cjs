const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const emptyState = `{clientOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          Nenhuma Ordem de Serviço encontrada.
                        </td>
                      </tr>
                    ) : clientOrders.map(os => (`

code = code.replace(/\{clientOrders\.map\(os => \(/g, emptyState);

fs.writeFileSync('src/components/Client.tsx', code);
