const fs = require('fs');

let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const driverEditFind = `                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Celular</label>
                  <input name="phone" defaultValue={driver.phone} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Validade CNH</label>`;

const driverEditReplace = `                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Celular</label>
                  <input name="phone" defaultValue={driver.phone} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha de Acesso</label>
                <div className="flex gap-2">
                  <input name="password" defaultValue={driver.password || ''} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Deixe em branco para não alterar" />
                  <button 
                    type="button" 
                    onClick={() => {
                      const form = document.querySelector('form') as HTMLFormElement;
                      if (!form) return;
                      const pwdInput = form.querySelector('input[name="password"]') as HTMLInputElement;
                      const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
                      const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
                      
                      const pwd = pwdInput?.value || driver.password;
                      let p = (phoneInput?.value || driver.phone).replace(/\\D/g, '');
                      
                      if (!pwd || !p) {
                        toast.error("Preencha o celular e a senha para enviar.");
                        return;
                      }
                      
                      if (p.length === 10 || p.length === 11) p = '55' + p;
                      const msg = \`Olá \${nameInput?.value || driver.name}! Sua senha de acesso ao sistema Qualp é: \${pwd}\`;
                      window.open(\`https://wa.me/\${p}?text=\${encodeURIComponent(msg)}\`, '_blank');
                    }}
                    className="px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2"
                    title="Enviar senha por WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Validade CNH</label>`;

content = content.replace(driverEditFind, driverEditReplace);

// Also need to handle saving the password in handleEditSubmit
const submitFind = `      vehicleType: (form.elements.namedItem('vehicleType') as HTMLInputElement).value,
      axes: parseInt((form.elements.namedItem('axes') as HTMLInputElement).value) || 0,
      bank: (form.elements.namedItem('bank') as HTMLInputElement).value,
      agency: (form.elements.namedItem('agency') as HTMLInputElement).value,`;

const submitReplace = `      vehicleType: (form.elements.namedItem('vehicleType') as HTMLInputElement).value,
      axes: parseInt((form.elements.namedItem('axes') as HTMLInputElement).value) || 0,
      bank: (form.elements.namedItem('bank') as HTMLInputElement).value,
      agency: (form.elements.namedItem('agency') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value || driver.password,`;

content = content.replace(submitFind, submitReplace);

fs.writeFileSync('src/components/Admin.tsx', content);

