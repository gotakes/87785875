import React, { useState, useMemo } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { OrderService } from '../types';
import { Save, FileText, CheckCircle2, Clock, AlertCircle, ArrowDownToLine, ArrowUpFromLine, User, Truck } from 'lucide-react';

export default function FinancePanel({ orders }: { orders: OrderService[] }) {
  const [activeTab, setActiveTab] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // Sort orders descending by createdAt or number
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => Number(b.number) - Number(a.number));
  }, [orders]);

  const handleEdit = (os: OrderService) => {
    setEditingId(os.id);
    if (activeTab === 'RECEIVABLE') {
      setEditForm({
        clientPaymentStatus: os.clientPaymentStatus || os.financialPaymentStatus || 'Pendente',
        clientPaymentType: os.clientPaymentType || os.financialPaymentType || 'À Vista',
        clientPaymentMethod: os.clientPaymentMethod || os.financialPaymentMethod || 'Pix',
        clientDueDate: os.clientDueDate || os.financialDueDate || '',
        clientPaidDate: os.clientPaidDate || os.financialPaidDate || ''
      });
    } else {
      setEditForm({
        driverPaymentStatus: os.driverPaymentStatus || (os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'),
        driverDueDate: os.driverDueDate || '',
        driverPaidDate: os.driverPaidDate || ''
      });
    }
  };

  const handleSave = async (id: string) => {
    try {
      const payload = { ...editForm };
      
      if (activeTab === 'RECEIVABLE') {
        if (payload.clientPaymentStatus === 'Pago') {
          payload.paymentStatusClient = 'PAID';
        } else if (payload.clientPaymentStatus === 'Pendente') {
          payload.paymentStatusClient = 'PENDING';
        }
      } else {
        if (payload.driverPaymentStatus === 'Pago') {
          payload.paymentStatusDriver = 'PAID';
        } else if (payload.driverPaymentStatus === 'Pendente') {
          payload.paymentStatusDriver = 'PENDING';
        }
      }

      await updateDoc(doc(db, 'orders', id), payload);
      toast.success('Informações financeiras atualizadas com sucesso!');
      setEditingId(null);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao atualizar dados financeiros.');
    }
  };

  const calculateTotals = () => {
    let totalReceivable = 0;
    let paidReceivable = 0;
    let totalPayable = 0;
    let paidPayable = 0;

    sortedOrders.forEach(os => {
      const grossValue = Number((os as any).totalValue) || 0;
      const netValue = Number((os as any).netValue) || 0;
      
      totalReceivable += grossValue;
      if (os.clientPaymentStatus === 'Pago' || os.financialPaymentStatus === 'Pago') {
        paidReceivable += grossValue;
      }
      
      totalPayable += netValue;
      if (os.driverPaymentStatus === 'Pago' || os.paymentStatusDriver === 'PAID') {
        paidPayable += netValue;
      }
    });

    return { 
      receivable: { total: totalReceivable, paid: paidReceivable, pending: totalReceivable - paidReceivable },
      payable: { total: totalPayable, paid: paidPayable, pending: totalPayable - paidPayable }
    };
  };

  const totals = calculateTotals();
  const currentTotal = activeTab === 'RECEIVABLE' ? totals.receivable : totals.payable;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 w-full overflow-hidden">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Controle Financeiro</h2>
          <p className="text-slate-500">Gestão separada de recebimentos (clientes) e pagamentos (motoristas).</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 px-4 md:px-0 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('RECEIVABLE'); setEditingId(null); }}
          className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-colors whitespace-nowrap ${
            activeTab === 'RECEIVABLE' 
            ? 'bg-emerald-600 text-white shadow-md' 
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowDownToLine size={20} />
          Contas a Receber (Clientes)
        </button>
        <button
          onClick={() => { setActiveTab('PAYABLE'); setEditingId(null); }}
          className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-colors whitespace-nowrap ${
            activeTab === 'PAYABLE' 
            ? 'bg-amber-600 text-white shadow-md' 
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowUpFromLine size={20} />
          Contas a Pagar (Motoristas)
        </button>
      </div>

      {/* DASHBOARD WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-4 md:px-0">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">
            {activeTab === 'RECEIVABLE' ? 'Total Faturado' : 'Total a Pagar (Frete Líquido)'}
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotal.total)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">
            {activeTab === 'RECEIVABLE' ? 'Total Recebido' : 'Total Pago'}
          </div>
          <div className={`text-2xl font-bold ${activeTab === 'RECEIVABLE' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotal.paid)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">Total Pendente</div>
          <div className="text-2xl font-bold text-red-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotal.pending)}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mb-6 mx-4 md:mx-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID / OS</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {activeTab === 'RECEIVABLE' ? 'Cliente' : 'Motorista'}
                </th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor (R$)</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                {activeTab === 'RECEIVABLE' && (
                  <>
                    <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Forma Pag.</th>
                  </>
                )}
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimento</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Baixa</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOrders.map(os => {
                const isEditing = editingId === os.id;
                
                const clientStatus = os.clientPaymentStatus || os.financialPaymentStatus || 'Pendente';
                const clientType = os.clientPaymentType || os.financialPaymentType || 'À Vista';
                const clientMethod = os.clientPaymentMethod || os.financialPaymentMethod || 'Pix';
                const clientDue = os.clientDueDate || os.financialDueDate;
                const clientPaid = os.clientPaidDate || os.financialPaidDate;
                
                const driverStatus = os.driverPaymentStatus || (os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente');
                const driverDue = os.driverDueDate;
                const driverPaid = os.driverPaidDate;

                const status = activeTab === 'RECEIVABLE' ? clientStatus : driverStatus;
                const dueDate = activeTab === 'RECEIVABLE' ? clientDue : driverDue;
                const paidDate = activeTab === 'RECEIVABLE' ? clientPaid : driverPaid;
                const value = activeTab === 'RECEIVABLE' ? Number((os as any).totalValue || 0) : Number((os as any).netValue || 0);

                return (
                  <tr key={os.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 text-sm font-medium text-slate-900">#{os.number}</td>
                    <td className="p-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        {activeTab === 'RECEIVABLE' ? (
                          <><User size={14} className="text-slate-400" /> {os.clientName || 'N/A'}</>
                        ) : (
                          <><Truck size={14} className="text-slate-400" /> {os.driverName || 'N/A'}</>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm font-semibold text-slate-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    </td>
                    
                    {isEditing ? (
                      <>
                        <td className="p-2">
                          <select 
                            value={activeTab === 'RECEIVABLE' ? editForm.clientPaymentStatus : editForm.driverPaymentStatus} 
                            onChange={e => setEditForm(activeTab === 'RECEIVABLE' ? {...editForm, clientPaymentStatus: e.target.value} : {...editForm, driverPaymentStatus: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Pago">Pago</option>
                            <option value="Parcial">Parcial</option>
                          </select>
                        </td>
                        
                        {activeTab === 'RECEIVABLE' && (
                          <>
                            <td className="p-2">
                              <select 
                                value={editForm.clientPaymentType} 
                                onChange={e => setEditForm({...editForm, clientPaymentType: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded p-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              >
                                <option value="À Vista">À Vista</option>
                                <option value="A Prazo">A Prazo</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <select 
                                value={editForm.clientPaymentMethod} 
                                onChange={e => setEditForm({...editForm, clientPaymentMethod: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded p-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              >
                                <option value="Pix">Pix</option>
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="Cartão de Débito">Cartão de Débito</option>
                                <option value="Boleto">Boleto</option>
                              </select>
                            </td>
                          </>
                        )}
                        
                        <td className="p-2">
                          <input 
                            type="date"
                            value={activeTab === 'RECEIVABLE' ? editForm.clientDueDate : editForm.driverDueDate}
                            onChange={e => setEditForm(activeTab === 'RECEIVABLE' ? {...editForm, clientDueDate: e.target.value} : {...editForm, driverDueDate: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="date"
                            value={activeTab === 'RECEIVABLE' ? editForm.clientPaidDate : editForm.driverPaidDate}
                            onChange={e => setEditForm(activeTab === 'RECEIVABLE' ? {...editForm, clientPaidDate: e.target.value} : {...editForm, driverPaidDate: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <button 
                            onClick={() => handleSave(os.id)}
                            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors flex items-center justify-center w-full"
                          >
                            <Save size={16} className="mr-1"/> Salvar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border
                            ${status === 'Pago' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              status === 'Parcial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              'bg-slate-100 text-slate-700 border-slate-200'}`}
                          >
                            {status === 'Pago' && <CheckCircle2 size={12} className="inline mr-1" />}
                            {status === 'Parcial' && <AlertCircle size={12} className="inline mr-1" />}
                            {status !== 'Pago' && status !== 'Parcial' && <Clock size={12} className="inline mr-1" />}
                            {status}
                          </span>
                        </td>
                        {activeTab === 'RECEIVABLE' && (
                          <>
                            <td className="p-3 text-sm text-slate-600">{clientType}</td>
                            <td className="p-3 text-sm text-slate-600">{clientMethod}</td>
                          </>
                        )}
                        <td className="p-3 text-sm text-slate-600">{dueDate ? new Date(dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</td>
                        <td className="p-3 text-sm text-slate-600">{paidDate ? new Date(paidDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleEdit(os)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            Editar
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              
              {sortedOrders.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'RECEIVABLE' ? 9 : 7} className="p-8 text-center text-slate-500">
                    Nenhuma Ordem de Serviço encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
