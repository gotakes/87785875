const fs = require('fs');

let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const stateFind = `  const [editingOs, setEditingOs] = useState<any>(null);`;
const stateAdd = `  const [editingOs, setEditingOs] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);`;
content = content.replace(stateFind, stateAdd);

const modalFind = `{editingOs && <EditOsModal os={editingOs} drivers={drivers} onClose={() => setEditingOs(null)} />}`;
const modalAdd = `{editingOs && <EditOsModal os={editingOs} drivers={drivers} onClose={() => setEditingOs(null)} />}
      {editingClient && <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} />}`;
content = content.replace(modalFind, modalAdd);

const listFind = `<td className="p-4 text-right">
                            <button 
        onClick={() => {
          setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL');
        }}
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      title="Acessar Cadastro/Financeiro"
    >
      <CreditCard size={18} />
    </button>
                          </td>`;

const listAdd = `<td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL');
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Acessar Cadastro/Financeiro"
                              >
                                <CreditCard size={18} />
                              </button>
                              <button 
                                onClick={() => setEditingClient(c)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar Cliente"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => {
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
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir Cliente"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>`;

content = content.replace(listFind, listAdd);

fs.writeFileSync('src/components/Admin.tsx', content);

