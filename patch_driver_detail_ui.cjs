const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// We need to replace the return statement of DriverDetailView
const driverReturnRegex = /return \(\n\s*<div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-300 pb-12">[\s\S]*?<\/div>\n\s*<\/div>\n\s*\);\n\}/g;

const match = [...code.matchAll(driverReturnRegex)][0]; // get the first match which should be DriverDetailView return block
if (match) {
   let newReturn = `return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-300 pb-12">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Voltar para Lista
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 font-display">{driver.name}</h2>
            <p className="text-slate-500 font-medium mt-1">Placa: {driver.vehiclePlateHorse} | Veículo: {driver.vehicleType}</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button onClick={() => setDetailTab('INFO')} className={\`px-6 py-2 rounded-lg font-bold text-sm transition-all \${detailTab === 'INFO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}\`}>
              Dados Cadastrais
            </button>
            <button onClick={() => setDetailTab('FINANCE')} className={\`px-6 py-2 rounded-lg font-bold text-sm transition-all \${detailTab === 'FINANCE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}\`}>
              Financeiro & OS
            </button>
          </div>
        </div>

        {detailTab === 'INFO' && (
          <div className="p-8">
            <div className="flex justify-end gap-3 mb-6">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={\`flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-colors \${
                  isEditing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }\`}
              >
                {isEditing ? 'Cancelar Edição' : <><Edit size={18} /> Editar Motorista</>}
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 bg-red-50/50 font-medium px-4 py-2 rounded-lg transition-colors border border-red-100"
              >
                <Trash2 size={18} /> Excluir
              </button>
            </div>
            
            {isEditing ? (
${match[0].split("{isEditing ? (")[1].split("</form>")[0]}
            </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visualização de dados, igual ao que já existia ou podemos abstrair, o que estava antes do isEditing no original era so um if e ja ia pros forms... */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Dados Pessoais</h3>
                  <div><span className="text-slate-500 text-sm">Nome:</span> <p className="font-semibold">{driver.name}</p></div>
                  <div><span className="text-slate-500 text-sm">CPF:</span> <p className="font-semibold">{driver.cpf}</p></div>
                  <div><span className="text-slate-500 text-sm">Celular:</span> <p className="font-semibold">{driver.phone}</p></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Dados Bancários</h3>
                  <div><span className="text-slate-500 text-sm">Chave PIX:</span> <p className="font-semibold">{driver.pixKey} ({driver.pixKeyType})</p></div>
                  <div><span className="text-slate-500 text-sm">Banco:</span> <p className="font-semibold">{driver.bank}</p></div>
                  <div><span className="text-slate-500 text-sm">Agência/Conta:</span> <p className="font-semibold">{driver.agency} / {driver.account}</p></div>
                </div>
              </div>
            )}
          </div>
        )}

        {detailTab === 'FINANCE' && (
          <div className="p-8 bg-slate-50">
             <div className="flex justify-between items-end mb-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Histórico de OS e Pagamentos</h3>
                   <p className="text-sm text-slate-500">Selecione as OSs para gerar extrato ou marcar como pago.</p>
                </div>
                <div className="flex gap-2">
                   <button 
                      onClick={() => {
                        const selected = driverOrders.filter(o => selectedOsIds[o.id!]);
                        if (selected.length === 0) return toast.error('Selecione pelo menos uma OS');
                        onGenerateStatement(selected, driver);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <FileText size={16} /> Gerar Extrato PDF
                    </button>
                    <button 
                      onClick={async () => {
                        const selected = driverOrders.filter(o => selectedOsIds[o.id!] && o.paymentStatusDriver !== 'PAID');
                        if (selected.length === 0) return toast.error('Selecione OSs pendentes');
                        for (const os of selected) {
                          await updateDoc(doc(db, 'orders', os.id!), { paymentStatusDriver: 'PAID' });
                        }
                        toast.success('Pagamento confirmado!');
                        setSelectedOsIds({});
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={16} /> Marcar como Pago
                    </button>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
                          onChange={e => {
                            const val = e.target.checked;
                            const newSelection = {...selectedOsIds};
                            driverOrders.filter(o => o.paymentStatusDriver !== 'PAID').forEach(o => newSelection[o.id!] = val);
                            setSelectedOsIds(newSelection);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">OS</th>
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Rota</th>
                      <th className="px-4 py-3 font-semibold text-right">Valor Líquido</th>
                      <th className="px-4 py-3 font-semibold text-center">Status Pgto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {driverOrders.map(os => (
                      <tr key={os.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" disabled={os.paymentStatusDriver === 'PAID'} checked={!!selectedOsIds[os.id!]}
                            onChange={e => setSelectedOsIds({...selectedOsIds, [os.id!]: e.target.checked})}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">#{os.number}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{os.origin.split(',')[0]} → {os.destinations?.[0]?.split(',')[0]}</td>
                        <td className="px-4 py-3 font-bold text-indigo-700 text-right">{formatBRL(os.netValue || 0)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={\`px-2 py-1 text-[10px] font-bold uppercase rounded-full \${os.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                            {os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {driverOrders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma OS encontrada</td></tr>}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}`;

   code = code.replace(match[0], newReturn + "\n}");
}

fs.writeFileSync('src/components/Admin.tsx', code);
