import { ExpandableCard } from './ExpandableCard';
import React, { useState, useEffect, useRef } from 'react';
import { Driver, OrderService } from '../types';
import PrintOsModal from './PrintOsModal';
import PrintStatementModal from './PrintStatementModal';
import PrintFiscalModal from './PrintFiscalModal';
import { Truck, MapPin, FileDown, Share2, Banknote, Navigation, Fuel, Route, LogOut, CheckCircle2, Camera, UploadCloud, FileText , Map as MapIcon, MessageCircle} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface DriverPanelProps {
  driver: Driver;
  orders: OrderService[];
  onLogout?: () => void;
}

export default function DriverPanel({ driver, orders, onLogout }: DriverPanelProps) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED' | 'INFORME'>('PENDING');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderService | null>(null);
  const [printOs, setPrintOs] = useState<OrderService | null>(null);
  const [showFiscal, setShowFiscal] = useState(false);
  const [statementData, setStatementData] = useState<{orders: OrderService[], role: 'CLIENT' | 'DRIVER' | 'ADMIN_TO_CLIENT' | 'ADMIN_TO_DRIVER', targetName: string, targetDocument: string, driverBankDetails: any} | null>(null);

  useEffect(() => {
    // Geo-tracking
    const driverRef = doc(db, 'drivers', driver.id);
    let watchId: number;

    const hasActiveOrder = orders.some(o => o.status === 'IN_TRANSIT');

    if (navigator.geolocation && hasActiveOrder) {
      updateDoc(driverRef, { status: 'MOVING' }).catch(console.error);
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateDoc(driverRef, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            status: 'MOVING'
          }).catch(console.error);
        },
        (error) => {
          console.warn('Geolocation warning:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      updateDoc(driverRef, { status: 'PARKED' }).catch(console.error);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [driver.id, orders]);

  const pendingOrders = orders.filter(o => o.status !== 'COMPLETED').sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});

  const handlePrint = (order: OrderService) => {
    setPrintOs(order);
  };

  const handleWhatsApp = (order: OrderService) => {
    const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const text = `*El Nathan - OS #${order.number}*\nOrigem: ${order.origin}\nDestinos: ${order.destinations.join(', ')}\nAdiantamento/Líquido: ${formatBRL(order.netValue)}\nPlaca: ${driver.vehiclePlateHorse}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    toast.success("Aba de impressão aberta!", {
      description: "Salve o PDF e clique abaixo para enviar.",
      action: {
        label: "Abrir WhatsApp",
        onClick: () => window.open(url, '_blank')
      },
      duration: 15000,
    });
  };

  const handleFileUpload = async (orderId: string, field: 'photoNfLoading' | 'photoNfDelivery' | 'photoCargoDelivery', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info('Comprimindo e enviando foto...');
    
    try {
      // Compress image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality jpeg
        
        const osRef = doc(db, 'orders', orderId);
        await updateDoc(osRef, { [field]: base64 });
        toast.success('Foto enviada com sucesso!');
      };
      
      img.src = URL.createObjectURL(file);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar foto.');
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'IN_TRANSIT' | 'COMPLETED') => {
    try {
      const osRef = doc(db, 'orders', orderId);
      await updateDoc(osRef, status === 'COMPLETED' ? { status, completedAt: new Date().toISOString() } : { status });
      toast.success(status === 'COMPLETED' ? 'Viagem Finalizada!' : 'Viagem Iniciada!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar status.');
    }
  };

  const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const renderOrderCard = (order: OrderService) => (
    <ExpandableCard
      key={order.id}
      id={order.id!}
      isExpanded={selectedOrder?.id === order.id}
      onToggle={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
      className="mb-3 md:mb-4"
      header={
        <div className="flex items-center gap-3 w-full">
          {activeTab === 'COMPLETED' && (
            <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                disabled={order.paymentStatusDriver === 'PAID'}
                checked={!!selectedOsIds[order.id!]}
                onChange={(e) => setSelectedOsIds({...selectedOsIds, [order.id!]: e.target.checked})}
              />
            </div>
          )}
          <div className="flex-1 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-indigo-600 uppercase">OS #{order.number}</span>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">{order.origin} → {order.destinations[0]}</h3>
            </div>
            <div className="flex items-center gap-4">
              {order.status !== 'COMPLETED' ? (
                <span className={`text-[10px] md:text-xs font-semibold px-2 py-1 md:px-3 rounded-full ${order.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.status === 'IN_TRANSIT' ? 'Em Rota' : order.status === 'APPROVED' ? 'Aprovado' : 'Pendente'}
                </span>
              ) : (
                <span className={`text-[10px] md:text-xs font-semibold px-2 py-1 md:px-3 rounded-full ${order.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {order.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'}
                </span>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-slate-50 rounded-xl p-3 md:p-4 mb-4 border border-slate-100">
        <div className="flex justify-between items-center text-xs md:text-sm mb-2">
          <span className="text-emerald-700 font-bold">LÍQUIDO DO MOTORISTA</span>
          <span className="font-bold text-emerald-700 text-lg md:text-xl">{formatBRL(order.netValue)}</span>
        </div>
        <div className="flex justify-between text-xs md:text-sm mt-2 pt-2 border-t border-slate-200">
          <span className="text-slate-500">Distância Total</span>
          <span className="font-bold text-slate-900">{order.distanceKm} km</span>
        </div>
      </div>

      {order.status !== 'COMPLETED' ? (
        <div className="space-y-3 md:space-y-4">
          <div className="bg-indigo-50/50 rounded-xl p-3 md:p-4 border border-indigo-100">
            <h4 className="font-semibold text-indigo-900 text-xs md:text-sm mb-3">1. Coleta</h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:flex-1 bg-white border border-indigo-200 text-indigo-700 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50 transition-colors">
                <Camera size={18} />
                {order.photoNfLoading ? 'NF de Coleta Enviada ✓' : 'Tirar Foto NF'}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileUpload(order.id, 'photoNfLoading', e)} />
              </label>
            </div>
            {(order.status === 'PENDING_APPROVAL' || order.status === 'APPROVED') && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'IN_TRANSIT')}
                className="mt-3 w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Iniciar Viagem (Em Trânsito)
              </button>
            )}
          </div>

          {order.status === 'IN_TRANSIT' && (
            <div className="bg-emerald-50/50 rounded-xl p-3 md:p-4 border border-emerald-100">
              <h4 className="font-semibold text-emerald-900 text-xs md:text-sm mb-3">2. Entrega</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="w-full sm:flex-1 bg-white border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <Camera size={18} />
                  {order.photoNfDelivery ? 'NF Assinada ✓' : 'Foto NF'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileUpload(order.id, 'photoNfDelivery', e)} />
                </label>
                <label className="w-full sm:flex-1 bg-white border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <Camera size={18} />
                  {order.photoCargoDelivery ? 'Carga Enviada ✓' : 'Foto Carga'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileUpload(order.id, 'photoCargoDelivery', e)} />
                </label>
              </div>
              <button 
                onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                className="mt-3 w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Finalizar Entrega
              </button>
              {(!order.photoNfDelivery || !order.photoCargoDelivery) && (
                <p className="text-[10px] text-center text-emerald-600 mt-2">Recomendamos enviar as fotos antes de finalizar.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-emerald-800">Viagem Finalizada</p>
          <p className="text-xs text-emerald-600/80 mt-1">Fotos e comprovantes enviados para a central.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
        <button 
          onClick={() => { window.open(`https://maps.google.com/?q=${order.destinations[0]}`, '_blank') }}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
        >
          <MapIcon size={18} /> Abrir Mapa
        </button>
        <button 
          onClick={() => window.open(`https://wa.me/?text=Status da OS %23${order.number}: ${order.status === 'COMPLETED' ? 'Finalizada' : 'Em Andamento'}`, '_blank')}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
        >
          <MessageCircle size={18} /> Reportar
        </button>
      </div>
    </ExpandableCard>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      {statementData && (
        <PrintStatementModal
          orders={statementData.orders}
          role={statementData.role}
          targetName={statementData.targetName}
          targetDocument={statementData.targetDocument}
          driverBankDetails={statementData.driverBankDetails}
          onClose={() => setStatementData(null)}
          onWhatsApp={() => {
             const total = statementData.orders.reduce((sum, os) => sum + (os.netValue), 0);
             const osList = statementData.orders.map(os => `- OS #${os.number}: R$ ${(os.netValue).toFixed(2).replace('.', ',')}`).join('%0A');
             const msg = `Olá, segue o extrato de cobrança das minhas viagens finalizadas:%0A%0A${osList}%0A%0A*Total a receber: R$ ${total.toFixed(2).replace('.', ',')}*`;
             toast.success("Aba de impressão aberta!", {
               description: "Salve o PDF e clique abaixo para enviar.",
               action: {
                 label: "Abrir WhatsApp",
                 onClick: () => window.open(`https://wa.me/?text=${msg}`, '_blank')
               },
               duration: 15000,
             });
          }}
        />
      )}
      {printOs && (
        <PrintOsModal 
          userRole="DRIVER"
          printOs={printOs} 
          onClose={() => setPrintOs(null)} 
          onWhatsApp={() => handleWhatsApp(printOs)} 
        />
      )}
      {showFiscal && (
        <PrintFiscalModal 
          driver={driver}
          orders={completedOrders}
          year={new Date().getFullYear().toString()}
          onClose={() => setShowFiscal(false)}
        />
      )}
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen flex flex-col relative print:hidden">
        
        {/* Header App */}
        <div className="bg-indigo-900 text-white px-3 md:px-6 py-5 shadow-md z-10 no-print">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-3">
              <Truck className="text-indigo-300" />
              <h1 className="text-lg md:text-xl font-bold tracking-tight font-display">El Nathan</h1>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="text-indigo-300 hover:text-white transition-colors"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-4">
            <div className="w-12 h-12 bg-indigo-800 rounded-full flex items-center justify-center font-bold text-xl border-2 border-indigo-500">
              {driver.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{driver.name}</p>
              <p className="text-indigo-300 text-xs">{driver.vehiclePlateHorse} • {driver.vehicleType}</p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="bg-slate-800 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 no-print shadow-inner">
          <div className={`w-2 h-2 rounded-full animate-pulse ${driver.status === 'MOVING' ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>
          GPS {driver.status === 'MOVING' ? 'Ativo (Rastreando em tempo real)' : 'Inativo (Parado)'}
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-slate-200 no-print overflow-x-auto whitespace-nowrap">
          <button 
            className={`flex-1 py-3 px-4 text-sm md:text-base font-bold border-b-2 transition-colors ${activeTab === 'PENDING' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setActiveTab('PENDING'); setMobileMenuOpen(false); }}
          >
            Atuais ({pendingOrders.length})
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm md:text-base font-bold border-b-2 transition-colors ${activeTab === 'COMPLETED' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setActiveTab('COMPLETED'); setMobileMenuOpen(false); }}
          >
            Histórico ({completedOrders.length})
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm md:text-base font-bold border-b-2 transition-colors ${activeTab === 'INFORME' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setActiveTab('INFORME'); setMobileMenuOpen(false); }}
          >
            Fiscal / IR
          </button>
        </div>

        {/* Content OS */}
        <div className="flex-1 p-2 md:p-4 overflow-y-auto bg-slate-100 print:p-0">
          {activeTab === 'PENDING' && (
            pendingOrders.length === 0 ? (
              <div className="text-center mt-12 text-slate-500">
                <Route size={48} className="mx-auto mb-3 md:mb-4 text-slate-300" />
                <p>Nenhuma viagem atual.</p>
              </div>
            ) : (
              pendingOrders.map(renderOrderCard)
            )
          )}
          
          {activeTab === 'COMPLETED' && (
            completedOrders.length === 0 ? (
              <div className="text-center mt-12 text-slate-500">
                <FileText size={48} className="mx-auto mb-3 md:mb-4 text-slate-300" />
                <p>Nenhuma viagem no histórico.</p>
              </div>
            ) : (
              completedOrders.map(renderOrderCard)
            )
          )}
          
          {activeTab === 'INFORME' && (
            <div className="bg-white p-3 md:p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-300 text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">Informe de Rendimentos</h3>
              <p className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4 md:mb-6">
                Emita seu extrato fiscal anual consolidado. Utilize este documento para comprovação de renda, emissão de NF-e e preenchimento da Declaração de Imposto de Renda (Carnê-Leão / DASN-SIMEI).
              </p>
              
              <div className="bg-slate-50 p-2 md:p-4 rounded-lg border border-slate-200 mb-3 md:mb-4 md:mb-6 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Resumo Anual ({new Date().getFullYear()})</p>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs md:text-sm text-slate-600">Total de Viagens (Concluídas)</span>
                  <span className="font-bold text-slate-900">{completedOrders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-600">Valor Líquido Recebido</span>
                  <span className="font-bold text-indigo-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      completedOrders.reduce((sum, os) => sum + (os.netValue || 0), 0)
                    )}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowFiscal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FileText size={18} />
                Gerar Informe Fiscal PDF
              </button>
            </div>
          )}
        </div>
        
        {activeTab === 'COMPLETED' && Object.values(selectedOsIds).some(v => v) && (
          <div className="bg-indigo-900 border-t border-indigo-700 p-2 md:p-4 flex flex-col items-center sticky bottom-0 z-20 shadow-lg print:hidden">
            <div className="w-full flex justify-between items-center mb-3">
              <p className="text-xs md:text-sm font-semibold text-indigo-200">Total Selecionado</p>
              <p className="text-xl md:text-2xl font-black text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  completedOrders.filter(os => selectedOsIds[os.id!]).reduce((sum, os) => sum + (os.netValue), 0)
                )}
              </p>
            </div>
            <div className="w-full flex gap-2">
              <button 
                onClick={() => {
                  const selectedOses = completedOrders.filter(os => selectedOsIds[os.id!]);
                  setStatementData({
                    orders: selectedOses,
                    role: 'DRIVER',
                    targetName: driver.name,
                    targetDocument: driver.cpf,
                    driverBankDetails: {
                      bank: driver.bank,
                      agency: driver.agency,
                      account: driver.account,
                      pix: driver.pixKey
                    }
                  });
                }}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-400 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <FileText size={18} /> Cobrança (PDF)
              </button>
              
              <button 
                onClick={async () => {
                  const selectedOses = completedOrders.filter(os => selectedOsIds[os.id!]);
                  let successCount = 0;
                  for (const os of selectedOses) {
                    try {
                      const osRef = doc(db, 'orders', os.id!);
                      await updateDoc(osRef, { paymentStatusDriver: 'PAID' });
                      successCount++;
                    } catch (e) {}
                  }
                  if (successCount > 0) {
                     toast.success(`${successCount} OSs confirmadas como recebidas!`);
                     setSelectedOsIds({});
                  }
                }}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Já Recebi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
