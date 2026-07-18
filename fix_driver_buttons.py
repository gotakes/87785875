import re

with open('src/components/Admin.tsx', 'r') as f:
    content = f.read()

# Replace the first occurrence of client_buttons (which is in DriverDetailView) with driver_buttons
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
                          const { db } = await import('../firebase');
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

content = re.sub(
    r'<div className="flex justify-between items-end mb-6">.*?<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">',
    driver_buttons + '\n             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">',
    content, count=1, flags=re.DOTALL
)

with open('src/components/Admin.tsx', 'w') as f:
    f.write(content)
