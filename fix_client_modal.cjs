const fs = require('fs');

let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const clientModalFind = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha (Opcional)</label>
              <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>`;

const clientModalReplace = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha de Acesso</label>
              <div className="flex gap-2">
                <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Deixe em branco para manter" />
                <button 
                  type="button" 
                  onClick={() => {
                    let p = formData.phone.replace(/\\D/g, '');
                    if (p.length === 10 || p.length === 11) p = '55' + p;
                    const msg = \`Olá \${formData.name}! Sua senha de acesso ao sistema Qualp é: \${formData.password}\`;
                    window.open(\`https://wa.me/\${p}?text=\${encodeURIComponent(msg)}\`, '_blank');
                  }}
                  disabled={!formData.password || !formData.phone}
                  className="px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  title="Enviar senha por WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>`;

content = content.replace(clientModalFind, clientModalReplace);
fs.writeFileSync('src/components/Admin.tsx', content);
