const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const targetStr = `                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs md:text-sm">
                      <th className="p-2 md:p-4 font-bold text-slate-700">Nome / Razão Social</th>
                      <th className="p-2 md:p-4 font-bold text-slate-700">Documento</th>
                      <th className="p-2 md:p-4 font-bold text-slate-700">Telefone</th>
                      <th className="p-2 md:p-4 font-bold text-slate-700 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-3 md:p-8 text-center text-slate-500">
                          Nenhum cliente cadastrado.
                        </td>
                      </tr>
                    ) : (
                      clients.map(c => (
                        <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-2 md:p-4 font-semibold text-indigo-600 hover:underline cursor-pointer" onClick={() => { setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL'); }}>{c.name}</td>
                          <td className="p-2 md:p-4 text-slate-600">{c.document}</td>
                          <td className="p-2 md:p-4 text-slate-600">{c.phone}</td>
                          <td className="p-2 md:p-4 text-right">
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
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>`;

const newStr = `                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs md:text-sm">
                      <th className="p-2 md:p-4 font-bold text-slate-700">Nome / Razão Social</th>
                      <th className="p-2 md:p-4 font-bold text-slate-700 hidden md:table-cell">Documento</th>
                      <th className="p-2 md:p-4 font-bold text-slate-700 hidden md:table-cell">Telefone</th>
                      <th className="p-2 md:p-4 font-bold text-slate-700 text-right hidden md:table-cell">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-3 md:p-8 text-center text-slate-500">
                          Nenhum cliente cadastrado.
                        </td>
                      </tr>
                    ) : (
                      clients.map(c => (
                        <React.Fragment key={c.id}>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer md:cursor-default" onClick={() => toggleClientExpanded(c.id!)}>
                          <td className="p-2 md:p-4 font-semibold text-indigo-600" onClick={(e) => { e.stopPropagation(); setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL'); }}>{c.name}</td>
                          <td className="p-2 md:p-4 text-slate-600 hidden md:table-cell">{c.document}</td>
                          <td className="p-2 md:p-4 text-slate-600 hidden md:table-cell">{c.phone}</td>
                          <td className="p-2 md:p-4 text-right hidden md:table-cell">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL');
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Acessar Cadastro/Financeiro"
                              >
                                <CreditCard size={18} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingClient(c); }}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar Cliente"
                              >
                                <Edit size={18} />
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
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir Cliente"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedClientIds[c.id!] && (
                          <tr className="md:hidden bg-slate-50/80">
                            <td colSpan={1} className="px-3 py-3 border-b border-slate-100">
                              <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="block text-slate-500 font-medium">Documento:</span>
                                    <span className="font-semibold text-slate-900">{c.document}</span>
                                  </div>
                                  <div>
                                    <span className="block text-slate-500 font-medium">Telefone:</span>
                                    <span className="font-semibold text-slate-900">{c.phone}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedClientId(c.id); setActiveTab('CLIENT_DETAIL'); }}
                                    className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-indigo-50 text-indigo-600 rounded-md font-medium"
                                  >
                                    <CreditCard size={16} /> Abrir
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditingClient(c); }}
                                    className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                                  >
                                    <Edit size={16} /> Editar
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
                                    className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-red-50 text-red-600 rounded-md font-medium"
                                  >
                                    <Trash2 size={16} /> Excluir
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>`;

if (content.includes(targetStr)) {
    fs.writeFileSync(filepath, content.replace(targetStr, newStr));
    console.log('Success client list');
} else {
    console.log('Client list str not found');
}
