const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const startMarker = `{activeTab === 'CLIENT_LIST' && (`;
const startIndex = content.indexOf(startMarker);

let braceCount = 0;
let endIndex = -1;
for (let i = startIndex + startMarker.length; i < content.length; i++) {
  if (content[i] === '(') braceCount++;
  else if (content[i] === ')') {
    if (braceCount === 0) {
      endIndex = i;
      break;
    }
    braceCount--;
  }
}

if (startIndex > -1 && endIndex > -1) {
    const originalBlock = content.substring(startIndex, endIndex + 1);
    
    const newBlock = `{activeTab === 'CLIENT_LIST' && (
          <div className="p-3 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-4 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 tracking-tight">Clientes</h2>
                <p className="text-slate-500 mt-2 font-medium">Gerenciamento de clientes cadastrados.</p>
              </div>
            </div>

            <div className="space-y-3">
              {clients.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Nenhum cliente cadastrado.
                </div>
              ) : (
                clients.map(c => (
                  <ExpandableCard
                    key={c.id}
                    id={c.id!}
                    isExpanded={!!expandedClientIds[c.id!]}
                    onToggle={toggleClientExpanded}
                    header={
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm md:text-lg">{c.name}</span>
                          <span className="text-xs text-slate-500 md:hidden">{c.phone}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-slate-500 text-xs">Telefone</span>
                            <span className="font-semibold text-slate-800">{c.phone}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-slate-500 text-xs">Documento</span>
                            <span className="font-semibold text-slate-800">{c.document}</span>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Documento (CPF/CNPJ)</p>
                        <p className="font-medium text-slate-900">{c.document || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone</p>
                        <p className="font-medium text-slate-900">{c.phone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL'); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                      >
                        <CreditCard size={18} /> Iniciar Suporte / Cadastro
                      </button>
                      <div className="w-full md:w-auto flex-1 md:ml-auto flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingClient(c); }}
                          className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                        >
                          <Edit size={18} /> Editar
                        </button>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation();
                            setConfirmModal({
                              title: 'Excluir Cliente',
                              message: 'Tem certeza que deseja excluir este cliente? Esta ação é irreversível.',
                              onConfirm: async () => {
                                try {
                                  await deleteDoc(doc(db, 'clients', c.id));
                                  toast.success("Cliente excluído");
                                } catch (error) {
                                  console.error("Erro ao excluir", error);
                                  toast.error("Erro ao excluir cliente");
                                }
                                setConfirmModal(null);
                              }
                            });
                          }}
                          className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={18} /> Excluir
                        </button>
                      </div>
                    </div>
                  </ExpandableCard>
                ))
              )}
            </div>
          </div>
        )}`;

    fs.writeFileSync(filepath, content.replace(originalBlock, newBlock));
    console.log("Successfully replaced CLIENT_LIST");
} else {
    console.log("Could not find bounds of CLIENT_LIST");
}
