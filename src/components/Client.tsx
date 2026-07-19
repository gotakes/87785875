import { ExpandableCard } from './ExpandableCard';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Client, OrderService, Driver } from '../types';
import { Menu, X, Map, FileText, Plus, LogOut, Minus, ArrowUpDown, CheckCircle2, MapPin, Printer , Search} from 'lucide-react';
import PrintOsModal from './PrintOsModal';
import PrintStatementModal from './PrintStatementModal';
import PrintFiscalModal from './PrintFiscalModal';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import RouteMap from './RouteMap';
import DriversMap from './Map';
import { toast } from 'sonner';
import AddressAutocomplete from './AddressAutocomplete';
import { PricingTier, PricingExcess, calculateFreightValue, defaultPricingTiers, defaultPricingExcess } from '../lib/pricing';

interface ClientPanelProps {
  client: Client;
  orders: OrderService[];
  drivers: Driver[];
  onLogout: () => void;
  pricingTiers: PricingTier[];
  pricingExcess: PricingExcess;
}


const getLocalDatetimeForInput = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  } catch(e) {
    return '';
  }
};
export default function ClientPanel({ client, orders, drivers, onLogout, pricingTiers, pricingExcess }: ClientPanelProps) {
  const [activeTab, setActiveTab] = useState<any>('OS_LIST');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMapMobile, setShowMapMobile] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [showMapMobile]);
  const [osStatusFilter, setOsStatusFilter] = useState('');
  const [osDateFrom, setOsDateFrom] = useState('');
  const [osDateTo, setOsDateTo] = useState('');
  const [osSearch, setOsSearch] = useState('');

  // NEW_OS form state
  const [routeOrigins, setRouteOrigins] = useState<string[]>(['']);
  const [routeDests, setRouteDests] = useState<string[]>(['']);
  const [vehicleType, setVehicleType] = useState('PASSEIO');
  const [cargoType, setCargoType] = useState('');
  const [observations, setObservations] = useState('');

          
  
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [printOs, setPrintOs] = useState<OrderService | null>(null);
  const [showFiscal, setShowFiscal] = useState(false);
  const [statementData, setStatementData] = useState<{orders: OrderService[], role: 'CLIENT' | 'DRIVER' | 'ADMIN_TO_CLIENT' | 'ADMIN_TO_DRIVER', targetName: string, targetDocument: string} | null>(null);
  const [mapOrigin, setMapOrigin] = useState('');
  const [mapDest, setMapDest] = useState('');
  const clientOrders = orders.filter(o => o.clientId === client.id);
  const filteredClientOrders = clientOrders.filter(os => {
    let match = true;
    if (osStatusFilter && os.status !== osStatusFilter) match = false;
    
    if (osDateFrom || osDateTo) {
      const osDate = new Date(os.createdAt);
      if (osDateFrom) {
         const from = new Date(osDateFrom + 'T00:00:00');
         if (osDate < from) match = false;
      }
      if (osDateTo) {
         const to = new Date(osDateTo + 'T23:59:59');
         if (osDate > to) match = false;
      }
    }
    
    if (osSearch) {
      const s = osSearch.toLowerCase();
      match = match && (
        (os.number && os.number.toLowerCase().includes(s)) ||
        (os.driverPlate && os.driverPlate.toLowerCase().includes(s)) ||
        (os.status && os.status.toLowerCase().includes(s))
      );
    }
    return match;
  });

  const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});
  const [expandedOsIds, setExpandedOsIds] = useState<Record<string, boolean>>({});
  
  const [osFormState, setOsFormState] = useState({ distance: 0, duration: 0, tollPerAxle: 0, axles: 1, otherExpenses: 0, driverId: '', vehicleType: '' });
  const currentVehicleType = osFormState.vehicleType || '';
  
  useEffect(() => {
    let defaultAxles = 1;
    const t = currentVehicleType.toLowerCase();
    if (t.includes('truck')) defaultAxles = 3;
    else if (t.includes('médio') || t.includes('medio') || t.includes('toco')) defaultAxles = 2;
    
    setOsFormState(prev => ({ ...prev, axles: defaultAxles }));
  }, [currentVehicleType]);

  const osFreightValue = calculateFreightValue(osFormState.distance, currentVehicleType, pricingTiers, pricingExcess);
  const osTollValue = osFormState.tollPerAxle * osFormState.axles;
  const osTotalValue = osFreightValue + osTollValue + osFormState.otherExpenses;
  
  const [routeParams, setRouteParams] = useState({ dieselPrice: 5.90, kmL: 2.5, isRoundTrip: true });
  const [baseRoute, setBaseRoute] = useState({ distance: 0, duration: 0, tollPerAxle: 0 });

  const handleRouteCalculated = useCallback(async (data: { distance: number, time: number }) => {
    const calculatedDistance = data.distance; // in km
    const calculatedDuration = data.time; // in seconds
    
    setBaseRoute({
      distance: calculatedDistance,
      duration: calculatedDuration,
      tollPerAxle: 0 // Será calculado pelo useEffect ou mantido 0 enquanto carrega
    });
  }, []);


  useEffect(() => {
    if (baseRoute.distance > 0 && !routeCalculated) {
      const fetchToll = async () => {
        try {
          const origins = mapOrigin.split(';');
          const dests = mapDest.split(';');
          let totalToll = 0; // Calculado localmente
          
          if (totalToll === 0) {
             // Fallback caso a API falhe ou falte a key
             totalToll = baseRoute.distance * 0.20 * (osFormState.axles || 2);
          }
          
          const tollPerAxle = (osFormState.axles || 2) > 0 ? totalToll / (osFormState.axles || 2) : totalToll;
          
          setBaseRoute(prev => ({ ...prev, tollPerAxle }));
        } catch (e) {
          console.error('Falha ao calcular pedágio com IA', e);
          const fallbackToll = baseRoute.distance * 0.20;
          setBaseRoute(prev => ({ ...prev, tollPerAxle: fallbackToll }));
        } finally {
          setRouteCalculated(true);
        }
      };
      
      fetchToll();
    }
  }, [baseRoute.distance, mapOrigin, mapDest, currentVehicleType, osFormState.axles, routeCalculated]);

  useEffect(() => {
    if (baseRoute.distance === 0) return;
    
    setOsFormState(prev => {
      const newDistance = parseFloat((baseRoute.distance).toFixed(1));
      const newTollPerAxle = parseFloat((baseRoute.tollPerAxle).toFixed(2));
      const newDuration = baseRoute.duration;
      
      if (prev.distance === newDistance && prev.tollPerAxle === newTollPerAxle && prev.duration === newDuration) {
        return prev;
      }
      return {
        ...prev,
        distance: newDistance,
        duration: newDuration,
        tollPerAxle: newTollPerAxle
      };
    });
  }, [baseRoute]);



  
  

  const handleCreateOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeCalculated || osTotalValue === 0) {
      toast.error('Calcule a rota antes de gerar a OS.');
      return;
    }
    
    try {
      const form = e.target as HTMLFormElement;
      const createdAtVal = (form.elements.namedItem('createdAt') as HTMLInputElement)?.value;
      const createdAt = createdAtVal ? new Date(createdAtVal).toISOString() : new Date().toISOString();
      
      const newOs = {
        number: Math.floor(100000 + Math.random() * 900000).toString(),
        clientId: client.id,
        clientName: client.name,
        clientDocument: client.document,
        driverId: '',
        status: 'PENDING_APPROVAL',
        origin: mapOrigin || routeOrigins[0] || '',
        destinations: mapDest ? mapDest.split(';') : routeDests.filter(d => d),
        cargoType,
        distanceKm: osFormState.distance,
        tollCost: (osFormState.tollPerAxle * osFormState.axles) || 0,
        otherExpenses: osFormState.otherExpenses || 0,
        freightMinimum: osFreightValue,
        grossValue: osFreightValue,
        netValue: osTotalValue * 0.85,
        carrierCommission: osTotalValue * 0.15,
        estimatedWeight: (form.elements.namedItem('estimatedWeight') as HTMLInputElement)?.value || '',
        cargoVolume: (form.elements.namedItem('cargoVolume') as HTMLInputElement)?.value || '',
        totalValue: osTotalValue,
        observations,
        vehicleType: currentVehicleType,
        createdAt,
        kmL: 0,
        dieselPrice: 0,
        fuelCost: 0
      };

      await addDoc(collection(db, 'orders'), newOs);
      
      toast.success('OS solicitada com sucesso!');
      setActiveTab('OS_LIST');
      setOsFormState({ distance: 0, duration: 0, tollPerAxle: 0, axles: 1, otherExpenses: 0, driverId: '', vehicleType: '' });
      setRouteOrigins(['']);
      setRouteDests(['']);
      setMapOrigin('');
      setMapDest('');
      setRouteCalculated(false);
      setCargoType('');
      setObservations('');
    } catch (error) {
      console.error("Error creating OS:", error);
      toast.error('Erro ao emitir OS. Tente novamente.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {statementData && (
        <PrintStatementModal
          orders={statementData.orders}
          role={statementData.role}
          targetName={statementData.targetName}
          targetDocument={statementData.targetDocument}
          onClose={() => setStatementData(null)}
          onWhatsApp={() => {
             const total = statementData.orders.reduce((sum, os) => sum + (os.totalValue || 0), 0);
             const osList = statementData.orders.map(os => `- OS #${os.number}: R$ ${(os.totalValue || 0).toFixed(2).replace('.', ',')}`).join('%0A');
             const msg = `Olá, segue o comprovante de faturamento das viagens realizadas para a empresa ${statementData.targetName}:%0A%0A${osList}%0A%0A*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
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
        <PrintOsModal userRole="CLIENT"
           printOs={printOs}
           onClose={() => setPrintOs(null)}
           onWhatsApp={() => {
            const text = `*Ordem de Serviço Nº ${printOs.number}*\n*Transportador:* EL NATHAN TRANSPORTES E SERVIÇOS\n*Origem:* ${printOs.origin}\n*Destino:* ${printOs.destinations?.join('; ') || 'N/A'}\n*Distância Prevista:* ${printOs.distanceKm} km\n*Frete:* ${new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(printOs.totalValue || 0)}`;
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            toast.success("Aba de impressão aberta!", {
              description: "Salve o PDF e clique abaixo para enviar.",
              action: {
                label: "Abrir WhatsApp",
                onClick: () => window.open(url, '_blank')
              },
              duration: 15000,
            });
          }}
        />
      )}
      {/* Sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}
      <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-64 bg-blue-900 text-blue-100 shrink-0 fixed md:static inset-y-0 left-0 z-50 h-full`}>
        <div className="p-3 md:p-6 border-b border-blue-800">
          <h1 className="text-lg md:text-xl font-bold tracking-tight font-display text-white mb-1">Portal do Cliente</h1>
          <p className="text-xs font-medium text-blue-300">{client.name}</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => { setActiveTab('OS_LIST'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${
              activeTab === 'OS_LIST' ? 'bg-blue-800 text-white font-bold' : 'hover:bg-blue-800/50 hover:text-white font-medium'
            }`}
          >
            <FileText size={20} /> Lista de OS
          </button>
          <button
            onClick={() => { setActiveTab('OS_CREATE'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${
              activeTab === 'OS_CREATE' ? 'bg-blue-800 text-white font-bold' : 'hover:bg-blue-800/50 hover:text-white font-medium'
            }`}
          >
            <FileText size={20} /> Precificação
          </button>
          <button
            onClick={() => { setActiveTab('MAP'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${
              activeTab === 'MAP' ? 'bg-blue-800 text-white font-bold' : 'hover:bg-blue-800/50 hover:text-white font-medium'
            }`}
          >
            <Map size={20} /> Mapa (Tempo Real)
          </button>
        </nav>
        <div className="p-2 md:p-4 border-t border-blue-800">
          <button
            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-950 hover:bg-black rounded-lg text-xs md:text-sm font-semibold text-white transition-colors"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 md:px-4 md:py-3 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold font-display text-blue-900">Portal do Cliente</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900 focus:outline-none">
            <Menu size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
        {activeTab === 'OS_LIST' && (
          <div className="h-full overflow-y-auto w-full animate-in fade-in duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-3 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 tracking-tight">Minhas Ordens de Serviço</h2>
                <p className="text-slate-500 mt-2 font-medium">Acompanhe e solicite novos transportes.</p>
              </div>
              <button 
                onClick={() => setActiveTab('OS_CREATE')}
                className="w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Plus size={18} /> Nova Solicitação
              </button>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar Nº da OS ou Destino..."
                    value={osSearch}
                    onChange={(e) => setOsSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-24">
              {filteredClientOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Nenhuma Ordem de Serviço encontrada.
                </div>
              ) : filteredClientOrders.map(os => (
                <ExpandableCard
                  key={os.id}
                  id={os.id!}
                  isExpanded={!!expandedOsIds[os.id!]}
                  onToggle={(id) => setExpandedOsIds(prev => ({ ...prev, [id]: !prev[id] }))}
                  header={
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={!!selectedOsIds[os.id!]}
                          onChange={(e) => {
                            setSelectedOsIds(prev => ({
                              ...prev,
                              [os.id!]: e.target.checked
                            }));
                          }}
                          disabled={os.paymentStatusClient === 'PAID'}
                          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm md:text-base">#{os.number}</span>
                            <span className="text-xs text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden md:block">
                            <span className="font-bold text-emerald-600 text-sm md:text-base">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(os.totalValue || 0)}</span>
                          </div>
                          <span className={`text-[10px] md:text-xs font-semibold rounded-full px-2 py-1 md:px-3 ${
                            os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            os.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' : 
                            os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {os.status === 'COMPLETED' ? 'Entregue' : 
                             os.status === 'IN_TRANSIT' ? 'Em Trânsito' : 
                             os.status === 'APPROVED' ? 'Aprovado' : os.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Origem</p>
                      <p className="font-medium text-slate-900 text-sm">{os.origin}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Destino</p>
                      <p className="font-medium text-slate-900 text-sm">{os.destinations.join('; ')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">Valor do Frete</p>
                      <p className="font-semibold text-emerald-600 text-lg">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(os.totalValue || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status de Pagamento</p>
                      <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {os.paymentStatusClient === 'PAID' ? 'PAGO' : 'PENDENTE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    {os.status === 'IN_TRANSIT' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('MAP'); setMobileMenuOpen(false); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Map size={18} /> Rastrear Em Tempo Real
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setPrintOs(os); }}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Printer size={18} /> Relatório PDF
                    </button>
                  </div>
                </ExpandableCard>
              ))}
            </div>

            {Object.values(selectedOsIds).some(v => v) && (
              <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-indigo-50 border-t border-indigo-200 p-3 md:p-4 flex justify-between items-center z-20 animate-in slide-in-from-bottom-2 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.1)]">
                <div className="flex items-center gap-2 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-indigo-800">Total Selecionado</p>
                    <p className="text-lg md:text-2xl font-black text-indigo-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        clientOrders.filter(os => selectedOsIds[os.id!]).reduce((sum, os) => sum + (os.totalValue || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const selectedOses = clientOrders.filter(os => selectedOsIds[os.id!]);
                    setStatementData({
                      orders: selectedOses,
                      role: 'CLIENT',
                      targetName: client.name,
                      targetDocument: client.document
                    });
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <FileText size={18} /> <span className="hidden md:inline">Gerar Extrato PDF</span><span className="md:hidden">Extrato</span>
                </button>
              </div>
            )}
          </div>
          </div>
        )}
        {activeTab === 'OS_CREATE' && (
          <div className="flex flex-col md:flex-row h-full animate-in fade-in duration-300 relative w-full">
            {/* Mobile Toggle Buttons */}
            <div className="md:hidden flex bg-white border-b border-slate-200 shrink-0">
              <button 
                onClick={() => setShowMapMobile(false)}
                className={`flex-1 py-3 text-sm md:text-base font-bold text-center border-b-2 ${!showMapMobile ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
              >
                Formulário
              </button>
              <button 
                onClick={() => setShowMapMobile(true)}
                className={`flex-1 py-3 text-sm md:text-base font-bold text-center border-b-2 ${showMapMobile ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
              >
                Visualizar Mapa
              </button>
            </div>

            {/* Left Sidebar Form (Qualp Clone) */}
            <div className={`${showMapMobile ? 'hidden md:flex' : 'flex'} w-full md:w-[450px] bg-white h-full overflow-y-auto border-r border-slate-200 shadow-2xl z-10 flex-col p-3 md:p-6 shrink-0`}>
              <div className="mb-3 md:mb-4 md:mb-6 border-b border-slate-100 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl md:text-xl md:text-2xl font-bold text-slate-900">Emissão de OS</h2>
                  <p className="text-slate-500 text-xs md:text-sm">Simulador de Rotas</p>
                </div>
                
              </div>

              <form 
                className="space-y-3 md:space-y-6 pb-24 md:pb-0"
                onChange={(e) => {
                  const form = e.currentTarget;
                  const distanceEl = form.elements.namedItem('distance') as HTMLInputElement | null;
                  const tollPerAxleEl = form.elements.namedItem('tollPerAxle') as HTMLInputElement | null;
                  const axlesEl = form.elements.namedItem('axles') as HTMLInputElement | null;
                  const otherExpensesEl = form.elements.namedItem('otherExpenses') as HTMLInputElement | null;
                  const driverIdEl = form.elements.namedItem('driverId') as HTMLSelectElement | null;
                  const vehicleTypeEl = form.elements.namedItem('vehicleType') as HTMLSelectElement | null;

                  setOsFormState(prev => ({
                    ...prev,
                    distance: distanceEl ? (parseFloat(distanceEl.value) || 0) : prev.distance,
                    tollPerAxle: tollPerAxleEl ? (parseFloat(tollPerAxleEl.value) || 0) : prev.tollPerAxle,
                    axles: axlesEl ? (parseInt(axlesEl.value) || 1) : prev.axles,
                    otherExpenses: otherExpensesEl ? (parseFloat(otherExpensesEl.value) || 0) : prev.otherExpenses,
                    driverId: driverIdEl ? driverIdEl.value : prev.driverId,
                    vehicleType: vehicleTypeEl ? vehicleTypeEl.value : prev.vehicleType
                  }));
                }}
                onSubmit={handleCreateOS}>
                {/* 1. SELEÇÃO DE MOTORISTA E VEÍCULO */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 border-b pb-2">Seleção de Veículo</h3>
                  <div className="grid grid-cols-1 gap-1.5 md:gap-4">
                    
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Tipo de Veículo</label>
                      <select name="vehicleType" value={osFormState.vehicleType} onChange={(e) => setOsFormState(prev => ({ ...prev, vehicleType: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 md:px-4 md:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                        <option value="">Selecione um veículo</option>
                        <option value="PASSEIO">PASSEIO</option>
                        <option value="FIORINO">FIORINO</option>
                        <option value="VAN/HR">VAN/HR</option>
                        <option value="VUC">VUC</option>
                        <option value="MÉDIO">MÉDIO</option>
                        <option value="TOCO">TOCO</option>
                        <option value="TRUCK">TRUCK</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. ROTA */}
                <div className="space-y-3 md:space-y-4 pt-4">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 border-b pb-2">Rota</h3>
                  
                  <div className="bg-slate-50 p-2 md:p-4 rounded-xl border border-slate-200">
                    <div className="space-y-3">
                                            <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Origens</label>
                          <button type="button" onClick={() => setRouteOrigins([...routeOrigins, ''])} className="text-indigo-600 hover:text-indigo-700" title="Adicionar origem">
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {routeOrigins.map((orig, idx) => (
                            <div key={idx} className="flex gap-2 items-center relative">
                              <AddressAutocomplete 
                                value={orig} 
                                onChange={(val) => {
                                  const newOrigs = [...routeOrigins];
                                  newOrigs[idx] = val;
                                  setRouteOrigins(newOrigs);
                                }} 
                                placeholder="Digite para buscar rua, bairro, cidade, estado..." 
                                className="flex-1"
                              />
                              {routeOrigins.length > 1 && (
                                <button type="button" onClick={() => setRouteOrigins(routeOrigins.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-1">
                                  <Minus size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-center py-2 relative">
                        <button 
                          type="button" 
                          onClick={() => { setRouteOrigins(routeDests); setRouteDests(routeOrigins); }} 
                          className="bg-white border border-slate-200 p-1.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
                          title="Inverter origem e destino"
                        >
                          <ArrowUpDown size={16} className="text-slate-500" />
                        </button>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Destinos</label>
                          <button type="button" onClick={() => setRouteDests([...routeDests, ''])} className="text-[#ff3b00] hover:text-[#d33100]" title="Adicionar destino">
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {routeDests.map((dest, idx) => (
                            <div key={idx} className="flex gap-2 items-center relative">
                              <AddressAutocomplete 
                                value={dest} 
                                onChange={(val) => {
                                  const newDests = [...routeDests];
                                  newDests[idx] = val;
                                  setRouteDests(newDests);
                                }} 
                                placeholder="Digite para buscar rua, bairro, cidade, estado..." 
                                className="flex-1"
                              />
                              {routeDests.length > 1 && (
                                <button type="button" onClick={() => setRouteDests(routeDests.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-1">
                                  <Minus size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      

                      

                      <button 
                        type="button" 
                        onClick={() => {
                          const validOrigins = routeOrigins.filter(Boolean);
                          const validDests = routeDests.filter(Boolean);
                          
                          if (validOrigins.length > 0 && validDests.length > 0) {
                            setMapOrigin(validOrigins.join(';'));
                            setMapDest(validDests.join(';'));
                            setRouteCalculated(false); // Map will trigger handleRouteCalculated
                          } else {
                            toast.error('Preencha Origem e Destino para calcular a rota.');
                          }
                        }}
                        className="w-full bg-black text-white font-bold text-base md:text-lg rounded-lg py-3 mt-2 uppercase tracking-wide hover:bg-gray-900 transition-colors"
                      >
                        Calcular Rota
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. INFORMAÇÕES ADICIONAIS */}
                <div className="space-y-3 md:space-y-4 pt-4">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 border-b pb-2">Informações da Carga</h3>
                  <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Data e Hora da OS</label>
                      <input name="createdAt" type="datetime-local" defaultValue={getLocalDatetimeForInput(new Date().toISOString())} className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">O que será transportado?</label>
                      <input name="cargoType" type="text" value={cargoType} onChange={(e) => setCargoType(e.target.value)} placeholder="Ex: Caixas de papelão, Eletrônicos" className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Peso Estimado (Kg) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                      <input name="estimatedWeight" type="text" placeholder="Ex: 1500" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Volumetria (M³) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                      <input name="cargoVolume" type="text" placeholder="Ex: 12" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Observações Adicionais</label>
                      <textarea name="observations" value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                    </div>
                  </div>
                </div>
                                <div className="mt-4 md:mt-6 bg-emerald-100 border border-emerald-300 rounded-xl p-2 md:p-4 flex justify-between items-center">
                  <span className="text-emerald-900 font-bold text-base md:text-lg">Frete Total da OS</span>
                  <span className="text-emerald-900 font-black text-xl md:text-2xl">
                    {routeCalculated && osTotalValue > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(osTotalValue) : 'R$ 0,00'}
                  </span>
                </div>
                <div className="pt-6 flex items-center justify-end gap-1.5 md:gap-4">
                  <button type="reset" className="px-3 md:px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                    Limpar
                  </button>
                  <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                    <CheckCircle2 size={20} />
                    Gerar OS
                  </button>
                </div>
              </form>
            </div>
            
            {/* Right Side Map */}
            <div className={`${!showMapMobile ? 'hidden md:block' : 'block'} flex-1 relative bg-slate-100 h-full`}>
              <RouteMap origin={mapOrigin} destination={mapDest} isRoundTrip={routeParams.isRoundTrip} onRouteCalculated={handleRouteCalculated} />
              
              {!routeCalculated && (
                <div className="hidden"></div>
              )}

              {routeCalculated && osFormState.distance > 0 && (
                <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl w-80 overflow-hidden flex flex-col border border-slate-200 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 p-2 md:p-4 border-b border-slate-200 text-center relative">
                    <h4 className="text-slate-900 font-bold uppercase tracking-widest text-xs md:text-sm mb-1">Rota 1</h4>
                    <p className="text-lg md:text-xl font-bold text-slate-800">{osFormState.distance} KM</p>
                    
                  </div>
                  <div className="p-2 md:p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-600 font-semibold">Tipo de veículo</span>
                      <span className="text-slate-900 font-bold">{currentVehicleType || 'Não selecionado'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-600 font-semibold">Duração</span>
                      <span className="text-slate-900 font-bold">{Math.floor(osFormState.duration / 3600)} h {Math.floor((osFormState.duration % 3600) / 60)} m</span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-600 font-semibold">Distância</span>
                      <span className="text-slate-900 font-bold">{osFormState.distance} km</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-600 font-semibold">Pedágio por eixo</span>
                      <span className="text-slate-900 font-bold">R$ {(osFormState.tollPerAxle).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center bg-slate-50 -mx-4 -mb-3 md:mb-4 p-2 md:p-4">
                      <span className="text-slate-800 font-bold">Frete Total da OS</span>
                      <span className="text-slate-900 font-black text-base md:text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(osTotalValue)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'MAP' && (
          <div className="h-full flex flex-col animate-in fade-in duration-300 p-3 md:p-8">
            <div className="mb-3 md:mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5 md:gap-4 px-4 md:px-0">
              <div>
                <h2 className="text-xl md:text-xl md:text-2xl font-bold text-slate-900">Acompanhar Carga</h2>
                <p className="text-slate-500">Localização em tempo real das suas entregas (OpenStreetMap via Leaflet)</p>
              </div>
              <div className="flex gap-1.5 md:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs md:text-sm text-slate-600 font-medium">Em Trânsito</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 rounded-lg md:rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <DriversMap drivers={drivers.filter(d => clientOrders.some(o => o.driverId === d.id && (o.status === 'IN_TRANSIT' || o.status === 'APPROVED')))} />
            </div>
          </div>
        )}

        {activeTab === 'INFORME' && (
          <div className="p-3 md:p-8 h-full overflow-y-auto animate-in fade-in duration-300">
            <div className="mb-3 md:mb-4 md:mb-8">
              <h2 className="text-xl md:text-xl md:text-2xl font-bold text-slate-900">Extrato Fiscal & Faturamento</h2>
              <p className="text-slate-500">Acompanhamento financeiro para emissão de Notas Fiscais (NFS-e).</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-2 md:gap-6 mb-3 md:mb-4 md:mb-8">
              <div className="bg-white p-3 md:p-6 rounded-lg md:rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider mb-2">OS Concluídas / Pagas</p>
                <p className="text-4xl font-black text-indigo-600">
                  {clientOrders.filter(os => os.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="bg-white p-3 md:p-6 rounded-lg md:rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pago no Mês</p>
                <p className="text-2xl md:text-3xl font-black text-emerald-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    clientOrders.filter(os => {
                      const osDate = new Date(os.createdAt);
                      const now = new Date();
                      return os.status === 'COMPLETED' && osDate.getMonth() === now.getMonth() && osDate.getFullYear() === now.getFullYear();
                    }).reduce((sum, os) => sum + (os.totalValue || 0), 0)
                  )}
                </p>
              </div>
              <div className="bg-white p-3 md:p-6 rounded-lg md:rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider mb-2">Volume Acumulado (Ano)</p>
                <p className="text-2xl md:text-3xl font-black text-indigo-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    clientOrders.filter(os => os.status === 'COMPLETED').reduce((sum, os) => sum + (os.totalValue || 0), 0)
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white p-3 md:p-8 rounded-lg md:rounded-2xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">Gerar Fechamento para Nota Fiscal</h3>
              <p className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4 md:mb-6">
                Faça o download do extrato consolidado contendo todas as Ordens de Serviço finalizadas sob sua conta. Este documento serve como base para faturamento e emissão da NFS-e.
              </p>
              <button 
                onClick={() => setShowFiscal(true)}
                className="w-full md:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm mx-auto"
              >
                <FileText size={18} />
                Exportar Extrato PDF
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
