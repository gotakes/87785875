const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const targetStr = `<div className="bg-white rounded-lg md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="px-2 py-2 md:px-6 md:py-4 font-medium">OS / Data</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 font-medium">Status</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 font-medium hidden md:table-cell">Motorista</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 font-medium hidden md:table-cell">Origem ➝ Destino</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 font-medium text-right hidden md:table-cell">Líquido Motorista</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 font-medium text-center hidden md:table-cell">Pagamentos</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 font-medium text-center hidden md:table-cell">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOS.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 md:px-6 py-12 text-center text-slate-500">
                          Nenhuma ordem de serviço encontrada.
                        </td>
                      </tr>
                    ) : filteredOS.filter(os => {
                      const s = osSearch.toLowerCase();
                      return os.number.includes(s) || 
                             (os.driverName || '').toLowerCase().includes(s) || 
                             os.status.toLowerCase().includes(s);
                    }).map(os => (
                      <React.Fragment key={os.id}>
                      <tr className="hover:bg-slate-50 transition-colors cursor-pointer md:cursor-default" onClick={() => toggleOsExpanded(os.id!)}>
                        <td className="px-2 py-2 md:px-6 md:py-4">
                          <div className="font-bold text-slate-900">#{os.number}</div>
                          <div className="text-xs text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
                        </td>
                        <td className="px-2 py-2 md:px-6 md:py-4">
                          <span className={\`text-xs font-semibold rounded-full px-3 py-1 \${
                            os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            os.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 
                            os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }\`}>
                            {os.status === 'COMPLETED' ? 'Concluída' : 
                             os.status === 'IN_TRANSIT' ? 'Em Trânsito' : 
                             os.status === 'APPROVED' ? 'Aprovado' : os.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-2 py-2 md:px-6 md:py-4 hidden md:table-cell">
                          <div className="text-xs md:text-sm font-medium text-slate-900">{os.driverName || 'Desconhecido'}</div>
                          <div className="text-xs text-slate-500">{os.vehicleType || '-'}</div>
                        </td>
                        <td className="px-2 py-2 md:px-6 md:py-4 hidden md:table-cell">
                          <div className="text-xs md:text-sm font-medium text-slate-900">{os.origin}</div>
                          <div className="text-xs text-slate-500">➝ {os.destinations?.join('; ') || 'N/A'}</div>
                        </td>
                        <td className="px-2 py-2 md:px-6 md:py-4 text-right hidden md:table-cell">
                          <div className="font-bold text-indigo-600">{formatBRL(os.netValue)}</div>
                          <div className="text-xs text-slate-500">Total: {formatBRL((os as any).totalValue || (os.grossValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0))}</div>
                        </td>
                        <td className="px-2 py-2 md:px-6 md:py-4 text-center hidden md:table-cell">
                          <div className="flex flex-col gap-1 items-center">
                            <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                              Cliente: {os.paymentStatusClient === 'PAID' ? 'Recebido' : 'Pendente'}
                            </span>
                            <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${os.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                              Motorista: {os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 md:px-6 md:py-4 text-center hidden md:table-cell">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setPrintOs(os); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Salvar em PDF"
                            >
                              <FileText size={18} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); sendOsWhatsApp(os); }}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Compartilhar"
                            >
                              <MessageCircle size={18} />
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingOs(os); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Editar OS"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteOs(os.id!); }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir Definitivamente"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedOsIds[os.id!] && (
                        <tr className="md:hidden bg-slate-50/80">
                          <td colSpan={2} className="px-3 py-3 border-t border-slate-100">
                            <div className="flex flex-col gap-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="block text-slate-500 font-medium">Motorista:</span>
                                  <span className="font-bold text-slate-900">{os.driverName || 'Desconhecido'}</span>
                                  <span className="block text-slate-500">{os.vehicleType || '-'}</span>
                                </div>
                                <div>
                                  <span className="block text-slate-500 font-medium">Líquido Motorista:</span>
                                  <span className="font-bold text-indigo-600">{formatBRL(os.netValue)}</span>
                                  <span className="block text-slate-500">Total: {formatBRL((os as any).totalValue || (os.grossValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0))}</span>
                                </div>
                              </div>
                              <div className="text-xs">
                                <span className="block text-slate-500 font-medium">Rota:</span>
                                <span className="font-semibold text-slate-900">{os.origin} ➝ {os.destinations?.join('; ') || 'N/A'}</span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                                <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                                  Cli: {os.paymentStatusClient === 'PAID' ? 'Pago' : 'Pendente'}
                                </span>
                                <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${os.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                                  Mot: {os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPrintOs(os); }}
                                  className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-indigo-50 text-indigo-600 rounded-md font-medium"
                                >
                                  <FileText size={16} /> PDF
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); sendOsWhatsApp(os); }}
                                  className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-emerald-50 text-emerald-600 rounded-md font-medium"
                                >
                                  <MessageCircle size={16} /> Whats
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingOs(os); }}
                                  className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                                >
                                  <Edit size={16} /> Editar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>`;

const newStr = `            <div className="space-y-3">
              {filteredOS.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Nenhuma ordem de serviço encontrada.
                </div>
              ) : filteredOS.filter(os => {
                const s = osSearch.toLowerCase();
                return os.number.includes(s) || 
                       (os.driverName || '').toLowerCase().includes(s) || 
                       os.status.toLowerCase().includes(s);
              }).map(os => (
                <ExpandableCard
                  key={os.id}
                  id={os.id!}
                  isExpanded={!!expandedOsIds[os.id!]}
                  onToggle={toggleOsExpanded}
                  header={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">#{os.number}</span>
                          <span className="text-xs text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')} - {new Date(os.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                          <span className="font-bold text-indigo-600 block">{formatBRL(os.netValue)}</span>
                          <span className="text-xs text-slate-500">Total: {formatBRL((os as any).totalValue || (os.grossValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0))}</span>
                        </div>
                        <span className={\`text-xs font-semibold rounded-full px-3 py-1 \${
                          os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          os.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 
                          os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }\`}>
                          {os.status === 'COMPLETED' ? 'Concluída' : 
                           os.status === 'IN_TRANSIT' ? 'Em Trânsito' : 
                           os.status === 'APPROVED' ? 'Aprovado' : os.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente / Motorista</p>
                      <p className="font-medium text-slate-900">{os.clientName || 'N/A'}</p>
                      <p className="text-sm text-slate-600">{os.driverName || 'Sem motorista'} <span className="text-xs text-slate-400">({os.vehicleType || '-'})</span></p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rota</p>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex gap-2"><span className="text-emerald-500 font-bold">A</span><span className="text-slate-700">{os.origin}</span></div>
                        <div className="flex gap-2"><span className="text-indigo-500 font-bold">B</span><span className="text-slate-700">{os.destinations?.join('; ') || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">KM Total / Peso</p>
                      <p className="font-semibold text-slate-900">{os.kmTotal} km / {os.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Líquido Motorista</p>
                      <p className="font-semibold text-indigo-600">{formatBRL(os.netValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status Pagamentos</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                          Cli: {os.paymentStatusClient === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${os.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                          Mot: {os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPrintOs(os); }}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                    >
                      <FileText size={18} /> <span className="hidden md:inline">Salvar em PDF</span><span className="md:hidden">PDF</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendOsWhatsApp(os); }}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle size={18} /> <span className="hidden md:inline">Compartilhar</span><span className="md:hidden">Whats</span>
                    </button>
                    <div className="w-full md:w-auto flex-1 md:ml-auto flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingOs(os); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                      >
                        <Edit size={18} /> Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteOs(os.id!); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} /> <span className="hidden md:inline">Cancelar OS</span><span className="md:hidden">Cancelar</span>
                      </button>
                    </div>
                  </div>
                </ExpandableCard>
              ))}
            </div>`;

if (content.includes(targetStr)) {
    fs.writeFileSync(filepath, content.replace(targetStr, newStr));
    console.log('Success replacing OS list');
} else {
    console.log('OS list str not found');
}
