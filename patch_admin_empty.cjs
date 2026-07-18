const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// For Orders list
code = code.replace(
  /\{orders\.filter\(os => \{[\s\S]*?\}\)\.map\(os => \(/,
  match => `{orders.filter(os => {
                      const s = osSearch.toLowerCase();
                      return os.number.includes(s) || 
                             (os.driverName || '').toLowerCase().includes(s) || 
                             os.status.toLowerCase().includes(s);
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                          Nenhuma ordem de serviço encontrada.
                        </td>
                      </tr>
                    ) : orders.filter(os => {
                      const s = osSearch.toLowerCase();
                      return os.number.includes(s) || 
                             (os.driverName || '').toLowerCase().includes(s) || 
                             os.status.toLowerCase().includes(s);
                    }).map(os => (`
);

// For Drivers list
code = code.replace(
  /\{drivers\.filter\(d => \{[\s\S]*?\}\)\.map\(driver => \(/,
  match => `{drivers.filter(d => {
                      const s = driverSearch.toLowerCase();
                      return d.name.toLowerCase().includes(s) || 
                             d.cpf.toLowerCase().includes(s) || 
                             d.vehiclePlateHorse.toLowerCase().includes(s);
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          Nenhum motorista encontrado.
                        </td>
                      </tr>
                    ) : drivers.filter(d => {
                      const s = driverSearch.toLowerCase();
                      return d.name.toLowerCase().includes(s) || 
                             d.cpf.toLowerCase().includes(s) || 
                             d.vehiclePlateHorse.toLowerCase().includes(s);
                    }).map(driver => (`
);

fs.writeFileSync('src/components/Admin.tsx', code);
