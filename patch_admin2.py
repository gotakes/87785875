import re

with open('src/components/Admin.tsx', 'r') as f:
    content = f.read()

# ClientDetailView counter & EXIBIR RELATÓRIO button rename
client_buttons = """
             <div className="flex justify-between items-end mb-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Histórico e Faturamento</h3>
                   <p className="text-sm text-slate-500">Selecione as OSs pendentes para gerar fatura ou marcar como recebido.</p>
                </div>
                <div className="flex items-center gap-3">
                    {clientOrders.filter(o => selectedOsIds[o.id!]).length > 0 && (
                      <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm">
                        📝 {clientOrders.filter(o => selectedOsIds[o.id!]).length} OSs selecionadas — Total: {formatBRL(clientOrders.filter(o => selectedOsIds[o.id!]).reduce((acc, os) => acc + (os.totalValue || 0), 0))}
                      </div>
                    )}
                   <button 
                      onClick={() => {
                        const selected = clientOrders.filter(o => selectedOsIds[o.id!]);
                        if (selected.length === 0) return toast.error('Selecione pelo menos uma OS');
                        onGenerateStatement(selected, client.name, client.document);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <FileText size={16} /> Exibir Relatório
                    </button>
                    <button 
                      onClick={async () => {
                        const selected = clientOrders.filter(o => selectedOsIds[o.id!] && o.paymentStatusClient !== 'PAID');
                        if (selected.length === 0) return toast.error('Selecione OSs pendentes');
                        for (const os of selected) {
                          const { updateDoc, doc } = await import('firebase/firestore');
                          const { db } = await import('../lib/firebase');
                          await updateDoc(doc(db, 'orders', os.id!), { paymentStatusClient: 'PAID' });
                        }
                        import('sonner').then(({toast}) => toast.success('Recebimento confirmado!'));
                        setSelectedOsIds({});
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={16} /> Marcar Recebido
                    </button>
                </div>
             </div>
"""
content = re.sub(
    r'<div className="flex justify-between items-end mb-6">.*?<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">',
    client_buttons + '\n             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">',
    content, flags=re.DOTALL
)

# DriverDetailView counter & EXIBIR RELATÓRIO button rename
driver_buttons = """
             <div className="flex justify-between items-end mb-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Histórico de Corridas</h3>
                   <p className="text-sm text-slate-500">Selecione as OSs pendentes para fechamento.</p>
                </div>
                <div className="flex items-center gap-3">
                    {driverOrders.filter(o => selectedOsIds[o.id!]).length > 0 && (
                      <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm">
                        📝 {driverOrders.filter(o => selectedOsIds[o.id!]).length} OSs selecionadas — Total: {formatBRL(driverOrders.filter(o => selectedOsIds[o.id!]).reduce((acc, os) => acc + (os.netValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0), 0))}
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        const selected = driverOrders.filter(o => selectedOsIds[o.id!]);
                        if (selected.length === 0) return toast.error('Selecione pelo menos uma OS');
                        onGenerateStatement(selected, driver);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <FileText size={16} /> Exibir Relatório
                    </button>
                    <button 
                      onClick={async () => {
                        const selected = driverOrders.filter(o => selectedOsIds[o.id!] && o.paymentStatusDriver !== 'PAID');
                        if (selected.length === 0) return toast.error('Selecione OSs pendentes');
                        for (const os of selected) {
                          const { updateDoc, doc } = await import('firebase/firestore');
                          const { db } = await import('../lib/firebase');
                          await updateDoc(doc(db, 'orders', os.id!), { paymentStatusDriver: 'PAID' });
                        }
                        import('sonner').then(({toast}) => toast.success('Pagamento confirmado!'));
                        setSelectedOsIds({});
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={16} /> Fechar Pagamento
                    </button>
                </div>
             </div>
"""
# Note: we need to replace the similar block in DriverDetailView. Let's make sure it matches.
# Wait, I'll use a more precise regex.
content = re.sub(
    r'<div className="flex justify-between items-end mb-6">\s*<div>\s*<h3 className="text-xl font-bold text-slate-900">Histórico de Corridas.*?<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">',
    driver_buttons + '\n             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">',
    content, flags=re.DOTALL
)

with open('src/components/Admin.tsx', 'w') as f:
    f.write(content)
