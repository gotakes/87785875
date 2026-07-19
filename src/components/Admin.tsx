import { ExpandableCard } from './ExpandableCard';
import { toast } from "sonner";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Driver, OrderService, Client } from '../types';
import FleetMap from './Map';
import RouteMap from './RouteMap';
import { Menu, Banknote, X, ArrowDownToLine, ArrowUpFromLine, CircleDollarSign, Plus, Minus, Map, Truck, BarChart3, FileText, UserPlus, CreditCard, Route, CheckCircle2, LogOut, ArrowLeft, Download, FileArchive, Trash2, Edit, Search, MapPin, PlusCircle, Eraser, Car, Bus, Bike, ChevronDown, ChevronUp, Fuel, Calendar, ArrowUpDown, MessageCircle , Filter} from 'lucide-react';
import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PricingTable from './PricingTable';
import FinancePanel from './FinancePanel';
import { PricingTier, PricingExcess, defaultPricingTiers, defaultPricingExcess, calculateFreightValue } from '../lib/pricing';
import AddressAutocomplete from './AddressAutocomplete';
import PrintOsModal from './PrintOsModal';
import PrintStatementModal from './PrintStatementModal';

interface AdminPanelProps {
  drivers: Driver[];
  orders: OrderService[];
  clients?: import('../types').Client[];
  onLogout?: () => void;
}

const getMultiplier = (vehicleType?: string) => {
  const type = vehicleType?.toLowerCase() || '';
  if (type.includes('passeio')) return 2.00;
  if (type.includes('utilit')) return 2.50;
  if (type.includes('van')) return 3.00;
  if (type.includes('vuc')) return 3.50;
  if (type.includes('toco')) return 4.00;
  if (type.includes('truck')) return 4.50;
  return 0; // if no match, we can either return 0 or default
};

type Tab = 'DASHBOARD' | 'MAP' | 'OS_CREATE' | 'OS_LIST' | 'DRIVER_LIST' | 'CLIENT_LIST' | 'DRIVER_DETAIL' | 'CLIENT_DETAIL' | 'FINANCE' | 'PRICING_TABLE';


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

function EditClientModal({ client, onClose }: { client: any, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: client.name || '',
    document: client.document || '',
    phone: client.phone || '',
    password: client.password || ''
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'clients', client.id), formData);
      toast.success('Cliente atualizado com sucesso.');
      onClose();
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error('Erro ao atualizar cliente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-lg md:rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-3 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Editar Cliente</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-3 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Nome / Razão Social</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-1.5 md:py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Documento (CPF/CNPJ)</label>
              <input type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="w-full px-3 py-1.5 md:py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-1.5 md:py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Senha de Acesso</label>
              <div className="flex gap-2">
                <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="flex-1 px-3 py-1.5 md:py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Deixe em branco para manter" />
                <button 
                  type="button" 
                  onClick={() => {
                    let p = formData.phone.replace(/\D/g, '');
                    if (p.length === 10 || p.length === 11) p = '55' + p;
                    const msg = `Olá ${formData.name}! Sua senha de acesso ao sistema Qualp é: ${formData.password}`;
                    window.open(`https://wa.me/${p}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  disabled={!formData.password || !formData.phone}
                  className="px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  title="Enviar senha por WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-3 py-1.5 md:px-4 md:py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancelar</button>
              <button type="submit" className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditOsModal({ os, drivers, onClose }: { os: any, drivers: any[], onClose: () => void }) {
  const handleEditOsSubmit = async (e: any) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const createdAtLocal = (form.elements.namedItem('createdAt') as HTMLInputElement)?.value;
      const createdAt = createdAtLocal ? new Date(createdAtLocal).toISOString() : os.createdAt;
      
      const driverId = (form.elements.namedItem('driverId') as HTMLSelectElement)?.value || '';
      const driverName = driverId ? drivers.find((d: any) => d.id === driverId)?.name || '' : '';
      
      let status = (form.elements.namedItem('status') as HTMLSelectElement).value;
      if (driverId && os.status === 'PENDING_APPROVAL' && status === 'PENDING_APPROVAL') {
          status = 'APPROVED';
      }

      const kmLValue = parseFloat((form.elements.namedItem('kmL') as HTMLInputElement)?.value || '0');
      const dieselPriceValue = parseFloat((form.elements.namedItem('dieselPrice') as HTMLInputElement)?.value || '0');
      const distanceKmValue = parseFloat((form.elements.namedItem('distanceKm') as HTMLInputElement).value);
      const fuelCost = kmLValue > 0 ? (distanceKmValue / kmLValue) * dieselPriceValue : 0;

      const updateData = {
        createdAt,
        driverId,
        driverName,
        distanceKm: distanceKmValue,
        grossValue: parseFloat((form.elements.namedItem('grossValue') as HTMLInputElement).value),
        carrierCommission: parseFloat((form.elements.namedItem('carrierCommission') as HTMLInputElement)?.value || '0'),
        netValue: parseFloat((form.elements.namedItem('netValue') as HTMLInputElement).value),
        tollCost: parseFloat((form.elements.namedItem('tollCost') as HTMLInputElement).value),
        otherExpenses: parseFloat((form.elements.namedItem('otherExpenses') as HTMLInputElement)?.value || '0'),
        origin: (form.elements.namedItem('origin') as HTMLInputElement).value,
        status,
        observations: (form.elements.namedItem('observations') as HTMLTextAreaElement).value,
        kmL: kmLValue,
        dieselPrice: dieselPriceValue,
        fuelCost,
      };

      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const { toast } = await import('sonner');
      await updateDoc(doc(db, 'orders', os.id), updateData);
      toast.success('OS atualizada com sucesso.');
      onClose();
    } catch (error) {
      console.error("Error updating OS: ", error);
      import('sonner').then(({toast}) => toast.error('Erro ao atualizar OS.'));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-3 md:p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Editar OS #{os.number}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={handleEditOsSubmit} className="p-3 md:p-6 space-y-3 md:space-y-6">
          <div className="grid grid-cols-2 gap-1.5 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Status</label>
              <select name="status" defaultValue={os.status} className="w-full border rounded-lg px-3 py-2">
                <option value="PENDING_APPROVAL">Pendente</option>
                <option value="APPROVED">Aprovada</option>
                <option value="IN_TRANSIT">Em Trânsito</option>
                <option value="COMPLETED">Finalizada</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="CANCELLED_CRITICAL">Cancelada (Crítico)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Data/Hora (Opcional)</label>
              <input type="datetime-local" name="createdAt" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Motorista</label>
              <select name="driverId" defaultValue={os.driverId || ''} className="w-full border rounded-lg px-3 py-2">
                <option value="">Sem motorista</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Origem (Início)</label>
              <input name="origin" defaultValue={os.origin} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Distância (KM)</label>
              <input name="distanceKm" type="number" step="0.1" defaultValue={os.distanceKm} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Valor Bruto (R$)</label>
              <input name="grossValue" type="number" step="0.01" defaultValue={os.grossValue} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Comissão (R$)</label>
              <input name="carrierCommission" type="number" step="0.01" defaultValue={os.carrierCommission || 0} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Líquido (R$)</label>
              <input name="netValue" type="number" step="0.01" defaultValue={os.netValue} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Pedágio (R$)</label>
              <input name="tollCost" type="number" step="0.01" defaultValue={os.tollCost || 0} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Outras Desp. (R$)</label>
              <input name="otherExpenses" type="number" step="0.01" defaultValue={os.otherExpenses || 0} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1">Observações</label>
            <textarea name="observations" defaultValue={os.observations || ''} className="w-full border rounded-lg px-3 py-2" rows={3}></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-3 py-1.5 md:px-4 md:py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPanel({ drivers, orders, clients = [], onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [financeSubTab, setFinanceSubTab] = useState<'DRIVERS' | 'CLIENTS'>('CLIENTS');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [printOs, setPrintOs] = useState<any>(null);
  const [editingOs, setEditingOs] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [statementData, setStatementData] = useState<any>(null);
  const [osSearch, setOsSearch] = useState('');
  const [osStatusFilter, setOsStatusFilter] = useState('');
  const [dashboardOsFilter, setDashboardOsFilter] = useState('');
  const [osDateFrom, setOsDateFrom] = useState('');
  const [osDateTo, setOsDateTo] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [routeOrigins, setRouteOrigins] = useState<string[]>(['']);
  const [routeDests, setRouteDests] = useState<string[]>(['']);
  const [mapOrigin, setMapOrigin] = useState('');
  const [mapDest, setMapDest] = useState('');
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [financeDriverId, setFinanceDriverId] = useState<string>('');
  const [financeClientId, setFinanceClientId] = useState<string>('');
  const [selectedFinanceClientOsIds, setSelectedFinanceClientOsIds] = useState<Record<string, boolean>>({});
  const [loadedClientOs, setLoadedClientOs] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);
  const [searchClientOs, setSearchClientOs] = useState<string>('');
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [expandedOsIds, setExpandedOsIds] = useState<Record<string, boolean>>({});
  const [expandedClientIds, setExpandedClientIds] = useState<Record<string, boolean>>({});
  const [expandedDriverIds, setExpandedDriverIds] = useState<Record<string, boolean>>({});

  const toggleOsExpanded = (id: string) => {
    setExpandedOsIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleClientExpanded = (id: string) => {
    setExpandedClientIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleDriverExpanded = (id: string) => {
    setExpandedDriverIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [showMapMobile]);
  const [selectedFinanceOsIds, setSelectedFinanceOsIds] = useState<Record<string, boolean>>({});

  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(() => {
    const saved = localStorage.getItem('pricingTiers');
    return saved ? JSON.parse(saved) : defaultPricingTiers;
  });
  const [pricingExcess, setPricingExcess] = useState<PricingExcess>(() => {
    const saved = localStorage.getItem('pricingExcess');
    return saved ? JSON.parse(saved) : defaultPricingExcess;
  });

  const handleSavePricing = (newTiers: PricingTier[], newExcess: PricingExcess) => {
    setPricingTiers(newTiers);
    setPricingExcess(newExcess);
    localStorage.setItem('pricingTiers', JSON.stringify(newTiers));
    localStorage.setItem('pricingExcess', JSON.stringify(newExcess));
  };
  
  const [osFormState, setOsFormState] = useState({ distance: 0, duration: 0, tollPerAxle: 0, axles: 1, otherExpenses: 0, driverId: '', vehicleType: '' });
  const selectedDriverForOs = drivers.find(d => d.id === osFormState.driverId);
  const currentVehicleType = osFormState.vehicleType || selectedDriverForOs?.vehicleType || '';
  
  useEffect(() => {
    let defaultAxles = 1;
    const t = currentVehicleType.toLowerCase();
    if (t.includes('truck')) defaultAxles = 3;
    else if (t.includes('médio') || t.includes('medio') || t.includes('toco')) defaultAxles = 2;
    
    setOsFormState(prev => ({ ...prev, axles: defaultAxles }));
  }, [currentVehicleType]);

  const osFreightValueCents = Math.round(calculateFreightValue(osFormState.distance, currentVehicleType, pricingTiers, pricingExcess) * 100);
  const osTollValueCents = Math.round((osFormState.tollPerAxle * osFormState.axles) * 100);
  const osOtherExpensesCents = Math.round(osFormState.otherExpenses * 100);
  const osTotalValue = (osFreightValueCents + osTollValueCents + osOtherExpensesCents) / 100;
  const osFreightValue = osFreightValueCents / 100;
  const osTollValue = osTollValueCents / 100;
  
  const [routeParams, setRouteParams] = useState({ dieselPrice: 5.90, kmL: 2.5, isRoundTrip: false });
  const [baseRoute, setBaseRoute] = useState({ distance: 0, duration: 0, tollPerAxle: 0 });

  const currentAxlesRef = useRef(3);
  useEffect(() => {
    currentAxlesRef.current = selectedDriverForOs?.axes || 3;
  }, [selectedDriverForOs?.axes]);

  const handleRouteCalculated = useCallback((data: { distance: number, time: number }) => {
    const calculatedDistance = data.distance; // in km
    const calculatedDuration = data.time; // in seconds
    
    // Suggest toll per axle based on distance, but let user change
    // Assuming ~R$ 0.15 per km is per axle
    const tollPerKmPerAxle = 0.15;
    const estimatedTollPerAxle = calculatedDistance * tollPerKmPerAxle;

    setBaseRoute({
      distance: calculatedDistance,
      duration: calculatedDuration,
      tollPerAxle: estimatedTollPerAxle
    });
    setRouteCalculated(true);
  }, []);

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

  const exportToCSV = () => {
    const headers = ["OS Number", "Driver Name", "Vehicle Plate", "Origin", "Destination", "Status", "Freight Value (R$)", "Toll (R$)", "Other Expenses (R$)", "Total Value (R$)", "Created At"];
    
    const csvData = orders.map(os => {
      return [
        os.number,
        `"${os.driverName || ""}"`,
        `"${os.driverPlate || ""}"`,
        `"${os.origin || ""}"`,
        `"${os.destinations?.join('; ') || ""}"`,
        os.status,
        os.grossValue || 0,
        os.tollCost || 0,
        os.otherExpenses || 0,
        (os.grossValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0),
        new Date(os.createdAt).toLocaleDateString("pt-BR")
      ].join(",");
    });
    
    const csvContent = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ordens_de_servico_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessQualpImages = async (imageFiles: File[], form: HTMLFormElement) => {
    if (imageFiles.length === 0) return;
    
    const label = document.getElementById('qualp-ai-label');
    const originalText = label?.textContent;
    if (label) label.textContent = 'Processando imagens com IA, aguarde...';

    try {
      const base64Promises = imageFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        });
      });
      
      const imagesBase64 = await Promise.all(base64Promises);
      
      // Netlify static version - no backend support for AI extract
      toast('Recurso de IA desativado na versão estática. Preencha manualmente.');
    } catch (err) {
      console.error(err);
      toast('Falha ao comunicar com o servidor de IA.');
    } finally {
      if (label) label.textContent = originalText || 'Anexar Print(s) do Qualp (Preenchimento por IA)';
    }
  };


  // Format currency
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleDeleteOs = async (osId: string) => {
    setConfirmModal({
      title: 'Excluir Ordem de Serviço',
      message: 'Tem certeza que deseja excluir esta Ordem de Serviço? Esta ação é irreversível e removerá a OS de todo o sistema.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'orders', osId));
          toast.success('OS excluída com sucesso.');
        } catch (error) {
          console.error("Error deleting OS:", error);
          toast.error('Erro ao excluir OS.');
        }
        setConfirmModal(null);
      }
    });
  };

  const sendOsWhatsApp = (os: OrderService) => {
    const text = `Olá! Segue em anexo o PDF da Ordem de Serviço Nº ${os.number}.`;

    let phone = (os.driverPhone || '').replace(/\D/g, '');
    if (phone.length === 10 || phone.length === 11) {
       phone = '55' + phone;
    }
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    
    toast.success("Aba de impressão aberta!", {
      description: "Salve o PDF e clique abaixo para enviar.",
      action: {
        label: "Abrir WhatsApp",
        onClick: () => window.open(url, '_blank')
      },
      duration: 15000,
    });
  };

  // Calculate Dash Stats
  const dashboardOrders = dashboardOsFilter ? orders.filter(os => os.id === dashboardOsFilter) : orders;
  const totalGross = dashboardOrders.reduce((acc, os) => acc + (os.totalValue || 0), 0);
  const totalCosts = dashboardOrders.reduce((acc, os) => acc + (os.tollCost || 0) + (os.fuelCost || 0) + (os.otherExpenses || 0), 0);
  
  const filteredOS = orders.filter(os => {
    let match = true;
    if (osStatusFilter && os.status !== osStatusFilter) match = false;
    
    if (osDateFrom || osDateTo) {
      // os.createdAt is ISO string
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
        (os.driverName && os.driverName.toLowerCase().includes(s)) ||
        (os.driverPlate && os.driverPlate.toLowerCase().includes(s)) ||
        (os.status && os.status.toLowerCase().includes(s)) ||
        (os.clientName && os.clientName.toLowerCase().includes(s))
      );
    }
    return match;
  });

  const totalOrders = orders.length;

  const osStatusData = [
    { name: 'Pendente', value: orders.filter(o => o.status === 'PENDING_APPROVAL').length, color: '#f59e0b' },
    { name: 'Aprovado', value: orders.filter(o => o.status === 'APPROVED').length, color: '#a855f7' },
    { name: 'Em Trânsito', value: orders.filter(o => o.status === 'IN_TRANSIT').length, color: '#6366f1' },
    { name: 'Concluída', value: orders.filter(o => o.status === 'COMPLETED').length, color: '#10b981' },
    { name: 'Cancelada', value: orders.filter(o => o.status === 'CANCELLED').length, color: '#ef4444' }
  ];

  // Group by date for bar chart (last 7 days or simply by date string)
  const revenueByDate = orders.reduce((acc, os) => {
    if (!os.createdAt) return acc;
    const date = new Date(os.createdAt).toLocaleDateString('pt-BR');
    if (!acc[date]) acc[date] = 0;
    acc[date] += (os.grossValue || 0);
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.keys(revenueByDate).map(date => ({
    date,
    revenue: revenueByDate[date]
  }));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* ================= PRINT LAYOUT ================= */}
      {statementData && (
        <PrintStatementModal
          orders={statementData.orders}
          role={statementData.role}
          targetName={statementData.targetName}
          targetDocument={statementData.targetDocument}
          driverBankDetails={statementData.driverBankDetails}
          onClose={() => setStatementData(null)}
          onWhatsApp={() => {
            const isClient = statementData.role === 'CLIENT' || statementData.role === 'ADMIN_TO_CLIENT';
            
            if (isClient) {
              const client = clients.find(c => c.document === statementData.targetDocument);
              const total = statementData.orders.reduce((sum, os) => sum + (os.totalValue || 0), 0);
              const osList = statementData.orders.map(os => `- OS #${os.number}: R$ ${(os.totalValue || 0).toFixed(2).replace('.', ',')}`).join('%0A');
              const msg = `Olá ${client?.name || statementData.targetName}, segue a fatura das viagens realizadas:%0A%0A${osList}%0A%0A*Total a pagar: R$ ${total.toFixed(2).replace('.', ',')}*`;
              const phone = client?.phone ? client.phone.replace(/\D/g, '') : '';
              toast.success("Aba de impressão aberta!", {
                description: "Salve o PDF e clique abaixo para enviar.",
                action: {
                  label: "Abrir WhatsApp",
                  onClick: () => window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
                },
                duration: 15000,
              });
            } else {
              const driver = drivers.find(d => d.cpf === statementData.targetDocument);
              const total = statementData.orders.reduce((sum, os) => sum + (os.netValue), 0);
              const osList = statementData.orders.map(os => `- OS #${os.number}: R$ ${(os.netValue).toFixed(2).replace('.', ',')}`).join('%0A');
              const msg = `Olá ${driver?.name || statementData.targetName}, segue o resumo de pagamento das suas viagens:%0A%0A${osList}%0A%0A*Total a receber: R$ ${total.toFixed(2).replace('.', ',')}*`;
              const phone = driver?.phone ? driver.phone.replace(/\D/g, '') : '';
              toast.success("Aba de impressão aberta!", {
                description: "Salve o PDF e clique abaixo para enviar.",
                action: {
                  label: "Abrir WhatsApp",
                  onClick: () => window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
                },
                duration: 15000,
              });
            }
          }}
        />
      )}
      {editingOs && <EditOsModal os={editingOs} drivers={drivers} onClose={() => setEditingOs(null)} />}
      {editingClient && <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} />}
      {printOs && (
        <PrintOsModal userRole="ADMIN"
           printOs={printOs}
           onClose={() => setPrintOs(null)}
           onWhatsApp={() => sendOsWhatsApp(printOs)} 
        />
      )}

      
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-lg md:rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
              <p className="text-slate-600">{confirmModal.message}</p>
            </div>
            <div className="px-2 py-2 md:px-6 md:py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 md:px-4 md:py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}
      <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-64 bg-slate-900 text-slate-300 shrink-0 print:hidden fixed md:static inset-y-0 left-0 z-50 h-full`}>
        <div className="p-3 md:p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 text-white mb-2">
              <Truck className="w-8 h-8 text-indigo-400" />
              <h1 className="text-lg md:text-xl font-bold tracking-tight font-display">El Nathan</h1>
            </div>
            <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Painel de Controle</p>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="hidden">
          <div className="flex items-center gap-3 text-white mb-2">
            <Truck className="w-8 h-8 text-indigo-400" />
            <h1 className="text-lg md:text-xl font-bold tracking-tight font-display">El Nathan</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Painel de Controle</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarButton 
            active={activeTab === 'DASHBOARD'} 
            icon={<CircleDollarSign size={20} />} 
            label="Visão Geral" 
            onClick={() => { setActiveTab('DASHBOARD'); setMobileMenuOpen(false); }} 
          />

          <SidebarButton 
            active={activeTab === 'OS_CREATE'} 
            icon={<FileText size={20} />} 
            label="Precificação" 
            onClick={() => { setActiveTab('OS_CREATE'); setMobileMenuOpen(false); }} 
          />
          <SidebarButton 
            active={activeTab === 'OS_LIST'} 
            icon={<FileArchive size={20} />} 
            label="Lista de OS" 
            onClick={() => { setActiveTab('OS_LIST'); setMobileMenuOpen(false); }} 
          />
          <SidebarButton 
            active={activeTab === 'FINANCE'} 
            icon={<CircleDollarSign size={20} />} 
            label="Controle Financeiro" 
            onClick={() => { setActiveTab('FINANCE'); setMobileMenuOpen(false); }} 
          />
          


                    <SidebarButton 
            active={activeTab === 'CLIENT_LIST'} 
            icon={<UserPlus size={20} />} 
            label="Clientes" 
            onClick={() => { setActiveTab('CLIENT_LIST'); setMobileMenuOpen(false); }} 
          />
          <SidebarButton 
            active={activeTab === 'DRIVER_LIST'} 
            icon={<UserPlus size={20} />} 
            label="Motoristas (Frota)" 
            onClick={() => { setActiveTab('DRIVER_LIST'); setMobileMenuOpen(false); }} 
          />
          <SidebarButton 
            active={activeTab === 'MAP'} 
            icon={<Map size={20} />} 
            label="Mapa (Tempo Real)" 
            onClick={() => { setActiveTab('MAP'); setMobileMenuOpen(false); }} 
          />
          
        </nav>
        
        {onLogout && (
          <div className="p-2 md:p-4 mt-auto">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800/50 hover:text-red-400"
            >
              <LogOut size={20} />
              <span>Sair do Sistema</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 print:hidden h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 md:px-4 md:py-3 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-base md:text-lg font-bold font-display text-slate-900">El Nathan</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900 focus:outline-none">
            <Menu size={24} />
          </button>
        </div>
        
        <div className={`flex-1 overflow-y-auto ${activeTab === 'OS_CREATE' ? 'p-0' : 'p-3 md:p-8'}`}>
        
        {activeTab === 'DASHBOARD' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-3 md:mb-4 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-4">
              <div>
                <h2 className="text-xl md:text-xl md:text-2xl font-bold text-slate-900">Visão Geral Financeira</h2>
                <p className="text-slate-500">Resumo de custos e fretes do período (Mensal)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-semibold text-slate-600">Filtrar por OS:</span>
                <select 
                  value={dashboardOsFilter}
                  onChange={(e) => setDashboardOsFilter(e.target.value)}
                  className="w-48 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm text-slate-700 shadow-sm"
                >
                  <option value="">Todas as OSs (Geral)</option>
                  {orders.map(os => (
                    <option key={os.id} value={os.id!}>OS #{os.number}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-2 md:gap-6 mb-3 md:mb-4 md:mb-8">
              <div 
                className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all group"
                onClick={() => { setActiveTab('OS_LIST'); setMobileMenuOpen(false); }}
              >
                <div className="flex items-center gap-1.5 md:gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                      Total de OSs 
                      <span className="text-indigo-500 ml-1 opacity-100 transition-opacity text-xs whitespace-nowrap">&rarr;</span>
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{dashboardOrders.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 md:gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-slate-500">Faturamento Bruto</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{formatBRL(totalGross)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 md:gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                    <Route size={24} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-slate-500">Custos (Combustível + Pedágio)</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{formatBRL(totalCosts)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-2 md:gap-6 mb-3 md:mb-4 md:mb-8">
              <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm">
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Faturamento por Data</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip formatter={(value: number) => formatBRL(value)} contentStyle={{ color: '#0f172a' }} itemStyle={{ color: '#0f172a' }} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm">
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Status das Ordens de Serviço</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={osStatusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {osStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ color: '#0f172a' }} itemStyle={{ color: '#0f172a' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 ml-4">
                    {osStatusData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs md:text-sm text-slate-600">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Drivers Payment Table */}
                        <div className="mb-6">
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 px-1">Fechamento por Motorista</h3>
              <div className="space-y-3">
                {drivers.map(driver => {
                  const driverOrders = orders.filter(o => o.driverId === driver.id);
                  const totalNet = driverOrders.reduce((acc, os) => acc + os.netValue, 0);

                  return (
                    <ExpandableCard
                      key={driver.id}
                      id={'dash_driver_' + driver.id!}
                      isExpanded={!!expandedDriverIds['dash_driver_' + driver.id!]}
                      onToggle={(id) => setExpandedDriverIds(prev => ({ ...prev, [id]: !prev[id] }))}
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-700 rounded-full hidden md:flex items-center justify-center font-bold text-lg">
                              {driver.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm md:text-lg">{driver.name}</span>
                              <span className="text-xs text-slate-500">{driver.vehiclePlateHorse}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-bold text-emerald-600 block text-sm md:text-base">{formatBRL(totalNet)}</span>
                              <span className="text-[10px] md:text-xs text-slate-500 hidden md:block">Líquido a Receber</span>
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Documento (CPF)</p>
                          <p className="font-medium text-slate-900 text-sm">{driver.cpf || 'N/A'}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dados Bancários / PIX</p>
                          <div className="text-sm font-medium text-slate-900">
                            PIX: {driver.pixKey} ({driver.pixKeyType})
                          </div>
                          <div className="text-xs text-slate-600">
                            {driver.bank} - Agência: {driver.agency} - Conta: {driver.account}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation();
                            setSelectedDriverId(driver.id);
                            // Se tiver state financeDriverId, usa
                            setActiveTab('DRIVER_DETAIL');
                          }}
                          className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                        >
                          <CreditCard size={18} /> Acerto Financeiro
                        </button>
                        <div className="w-full md:w-auto flex-1 md:ml-auto flex gap-2">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation();
                              setSelectedDriverId(driver.id);
                              setActiveTab('DRIVER_DETAIL');
                            }}
                            className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                          >
                            <UserPlus size={18} /> Perfil Completo
                          </button>
                        </div>
                      </div>
                    </ExpandableCard>
                  );
                })}
              </div>
            </div>
          </div>
        )}


        {activeTab === 'FINANCE' && (
          <FinancePanel orders={orders} />
        )}
        {activeTab === 'MAP' && (
          <div className="h-full flex flex-col animate-in fade-in duration-300">
            <div className="mb-3 md:mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5 md:gap-4 px-4 md:px-0">
              <div>
                <h2 className="text-xl md:text-xl md:text-2xl font-bold text-slate-900">Monitoramento da Frota</h2>
                <p className="text-slate-500">Posição em tempo real dos veículos (OpenStreetMap via Leaflet)</p>
              </div>
              <div className="flex gap-1.5 md:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs md:text-sm text-slate-600 font-medium">Em Trânsito</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs md:text-sm text-slate-600 font-medium">Parado</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 rounded-lg md:rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <FleetMap drivers={drivers.filter(d => orders.some(o => o.driverId === d.id && (o.status === 'IN_TRANSIT' || o.status === 'APPROVED')))} />
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
                <button
                  onClick={(e) => { e.preventDefault(); setActiveTab('PRICING_TABLE'); }}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Configurar Tabela de Preços"
                >
                  <CircleDollarSign size={20} />
                </button>
              </div>
              <div className="bg-indigo-50 p-2 md:p-4 rounded-xl mb-3 md:mb-4 border border-indigo-100 shadow-sm">
                <label className="block text-sm md:text-base font-bold text-indigo-900 mb-2">Carregar OS do Cliente (Nº)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ex: 123456" 
                    value={searchClientOs} 
                    onChange={e => setSearchClientOs(e.target.value)} 
                    className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const searchStr = searchClientOs.trim();
                      const found = orders.find(o => o.number === searchStr || o.id === searchStr);
                      if (found) {
                        if (found.status !== 'PENDING_APPROVAL' && found.status !== 'APPROVED') {
                           toast.warning('Aviso: Esta OS já está em andamento ou concluída.');
                        }
                        setLoadedClientOs(found);
                        setRouteOrigins([found.origin]);
                        setRouteDests(found.destinations || []);
                        
                        setOsFormState(prev => ({
                          ...prev,
                          distance: found.distanceKm || 0,
                          tollPerAxle: (found.tollCost || 0) / (found.axles || 1), // approximate
                          axles: found.axles || 1,
                          otherExpenses: found.otherExpenses || 0,
                          driverId: found.driverId || '',
                          vehicleType: found.vehicleType || ''
                        }));
                        
                        setMapOrigin(found.origin);
                        setMapDest((found.destinations || []).join(';'));
                        setRouteCalculated(true);
                        
                        toast.success('OS carregada com sucesso. Verifique os dados.');
                      } else {
                        toast.error('OS não encontrada. Verifique o número.');
                      }
                    }}
                    className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Buscar
                  </button>
                </div>
                {loadedClientOs && (
                   <div className="mt-3 text-xs text-indigo-700 bg-white p-2 rounded border border-indigo-100 flex justify-between items-center">
                     <span>Editando OS #{loadedClientOs.number} do cliente: {loadedClientOs.clientName}</span>
                     <button type="button" onClick={() => setLoadedClientOs(null)} className="text-red-500 hover:underline">Cancelar</button>
                   </div>
                )}
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
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const distStr = (form.elements.namedItem('distance') as HTMLInputElement).value;
                  const tollPerAxleStr = (form.elements.namedItem('tollPerAxle') as HTMLInputElement).value;
                  const axlesStr = (form.elements.namedItem('axles') as HTMLInputElement).value;
                  const otherExpStr = (form.elements.namedItem('otherExpenses') as HTMLInputElement)?.value || '0';
                  
                  const driverId = (form.elements.namedItem('driverId') as HTMLSelectElement).value;
                  const cargoType = "Carga Geral";
                  const dieselPriceStr = (form.elements.namedItem('dieselPrice') as HTMLInputElement)?.value;
                  const dieselPrice = parseFloat(dieselPriceStr) || 0;
                  const kmLStr = (form.elements.namedItem('kmL') as HTMLInputElement)?.value;
                  const kmL = parseFloat(kmLStr) || 1;
                  
                  const origin = routeOrigins.filter(Boolean).join(';');
                  const dest = routeDests.filter(Boolean).join(';');
                  
                  if (!origin || !dest) {
                    toast('Preencha e calcule a rota de origem e destino antes de gerar a OS.');
                    return;
                  }
                  if (!driverId) {
                    toast('Selecione um motorista.');
                    return;
                  }
                  
                  const distanceKm = parseFloat(distStr) || 0;
                  const tollPerAxle = parseFloat(tollPerAxleStr) || 0;
                  const axles = parseInt(axlesStr) || 1;
                  const tollCost = tollPerAxle * axles;
                  const otherExpenses = parseFloat(otherExpStr) || 0;
                  const fuelCost = kmL > 0 ? (distanceKm / kmL) * dieselPrice : 0;
                  
                  const selectedDriver = drivers.find(d => d.id === driverId);
                  const vehicleTypeInput = (form.elements.namedItem('vehicleType') as HTMLSelectElement)?.value || '';
                  const currentVehicleType = vehicleTypeInput || selectedDriver?.vehicleType || '';
                  
                  const grossValueCents = Math.round(calculateFreightValue(distanceKm, currentVehicleType, pricingTiers, pricingExcess) * 100);
                  const tollCostCents = Math.round(tollCost * 100);
                  const otherExpensesCents = Math.round(otherExpenses * 100);
                  const totalValueCalcCents = grossValueCents + tollCostCents + otherExpensesCents;
                  
                  const grossValue = grossValueCents / 100;
                  const totalValueCalc = totalValueCalcCents / 100;
                  
                  const carrierCommission = (grossValueCents * 15) / 10000;
                  const netValue = (grossValueCents * 85) / 10000;
                  // Combustível é custo do motorista, mas o líquido dele com a transportadora é o netValue.
                  
                  // Geração de número único de OS garantido
                  let osNumber;
                  do {
                    osNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                  } while (orders.some(o => o.number === osNumber));

                  try {
                    const osData = {
                      number: loadedClientOs ? loadedClientOs.number : osNumber,
                      clientId: loadedClientOs ? loadedClientOs.clientId : undefined,
                      clientName: loadedClientOs ? loadedClientOs.clientName : undefined,
                      clientDocument: loadedClientOs ? loadedClientOs.clientDocument : undefined,
                      driverId,
                      driverName: selectedDriver?.name || '',
                      driverCpf: selectedDriver?.cpf || '',
                      driverPhone: selectedDriver?.phone || '',
                      driverPlate: selectedDriver?.vehiclePlateHorse || '',
                      driverPix: selectedDriver?.account || '', // Ou usar algum outro campo para conta
                      vehicleType: currentVehicleType,
                      axles,
                      tollPerAxle,
                      capacityWeight: selectedDriver?.capacityWeight || '',
                      bodyType: selectedDriver?.bodyType || '',
                      yearModel: selectedDriver?.yearModel || '',
                      status: 'APPROVED',
                      origin,
                      destinations: dest.split(';').map(d => d.trim()).filter(Boolean),
                      collectionDateTime: new Date().toISOString(),
                      deliveryDateTime: new Date(Date.now() + 86400000).toISOString(),
                      cargoType,
                      estimatedWeight: (form.elements.namedItem('estimatedWeight') as HTMLInputElement)?.value || '',
                      cargoVolume: (form.elements.namedItem('cargoVolume') as HTMLInputElement)?.value || '',
                      observations: '',
                      invoiceNumber: '',
                      serviceType: 'Transporte Rodoviário',
                      paymentMethod: 'A combinar',
                      
                      distanceKm,
                      grossValue, // Frete Base
                      tollCost,
                      otherExpenses,
                      fuelCost,
                      carrierCommission,
                      netValue,
                      totalValue: grossValue + tollCost + otherExpenses,
                      
                      createdAt: (form.elements.namedItem('createdAt') as HTMLInputElement)?.value ? new Date((form.elements.namedItem('createdAt') as HTMLInputElement).value).toISOString() : new Date().toISOString(),
                      completedAt: null
                    };

                    if (loadedClientOs) {
                      await updateDoc(doc(db, "orders", loadedClientOs.id), osData);
                      toast.success(`OS #${loadedClientOs.number} aprovada com sucesso!`);
                      setLoadedClientOs(null);
                      setSearchClientOs('');
                    } else {
                      await addDoc(collection(db, "orders"), osData);
                      toast.success(`OS Emitida com Sucesso!\nDistância: ${distStr}km\nPedágio: R$ ${tollCost.toFixed(2)}`);
                    }
                    setPrintOs(osData);
                    form.reset();
                    setRouteOrigins(['']);
                    setRouteDests(['']);
                    setMapOrigin('');
                    setMapDest('');
                    setRouteCalculated(false);
                    setOsFormState({ distance: 0, duration: 0, tollPerAxle: 0, axles: 1, otherExpenses: 0, driverId: '', vehicleType: '' });
                  } catch (error) {
                    console.error("Error creating OS:", error);
                    toast.error('Erro ao emitir OS. Tente novamente.');
                  }
                }}
              >
                {/* 1. SELEÇÃO DE MOTORISTA E VEÍCULO */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 border-b pb-2">Seleção de Motorista e Veículo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Motorista</label>
                      <select name="driverId" required className="w-full rounded-lg border border-slate-300 px-3 py-1.5 md:px-4 md:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                        <option value="">Selecione...</option>
                        {drivers.map(d => {
                          const isBlocked = d.operationalStatus === 'BLOCKED_COMPLIANCE' || d.lockedBalance! > 0;
                          return (
                            <option key={d.id} value={d.id} disabled={isBlocked}>
                              {d.name} ({d.vehiclePlateHorse}) {isBlocked ? ' - BLOQUEADO' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Tipo de Veículo</label>
                      <select name="vehicleType" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 md:px-4 md:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                        <option value="">Automático (Pelo Motorista)</option>
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
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 border-b pb-2">Rota, Custo e Frete</h3>
                  
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
                      
                      <div className="flex justify-center -my-2 relative z-10 pointer-events-none">
                        <button 
                          type="button" 
                          onClick={() => { setRouteOrigins(routeDests); setRouteDests(routeOrigins); }} 
                          className="bg-white border border-slate-200 p-1.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors pointer-events-auto"
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
                      
                      <div className="grid grid-cols-2 gap-1.5 md:gap-4 mt-2">
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Consumo (Km/L)</label>
                          <input name="kmL" type="number" step="0.01" value={routeParams.kmL} onChange={(e) => setRouteParams(p => ({ ...p, kmL: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 md:px-4 md:py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Preço (Km/L)</label>
                          <input name="dieselPrice" type="number" step="0.01" value={routeParams.dieselPrice} onChange={(e) => setRouteParams(p => ({ ...p, dieselPrice: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 md:px-4 md:py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 mt-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors border border-transparent">
                        <input 
                          type="checkbox" 
                          checked={routeParams.isRoundTrip}
                          onChange={(e) => setRouteParams(p => ({ ...p, isRoundTrip: e.target.checked }))}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-xs md:text-sm font-medium text-slate-700">Ida e Volta</span>
                      </label>

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

                {/* 3. RESULTADOS E TOTAIS */}
                <div className="space-y-3 md:space-y-4 pt-4">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 border-b pb-2">Valores</h3>
                  <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Distância (Km)</label>
                      <input name="distance" value={osFormState.distance || ''} onChange={(e) => setOsFormState(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))} type="number" step="0.1" placeholder="0" className="w-full bg-slate-100 rounded border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Pedágio p/ Eixo (R$)</label>
                      <input name="tollPerAxle" value={osFormState.tollPerAxle || ''} onChange={(e) => setOsFormState(prev => ({ ...prev, tollPerAxle: parseFloat(e.target.value) || 0 }))} type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-100 rounded border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Qtd. Eixos</label>
                      <input name="axles" value={osFormState.axles || ''} onChange={(e) => setOsFormState(prev => ({ ...prev, axles: parseInt(e.target.value) || 1 }))} type="number" min="1" step="1" placeholder="1" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Total Pedágio (R$)</label>
                      <input name="tollTotal" type="number" step="0.01" readOnly value={(osFormState.axles * osFormState.tollPerAxle).toFixed(2)} className="w-full bg-slate-100 rounded border border-slate-300 px-3 py-2 text-slate-500 cursor-not-allowed focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Peso Estimado (Kg)</label>
                      <input name="estimatedWeight" type="text" placeholder="Ex: 1500" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Volumetria (M³)</label>
                      <input name="cargoVolume" type="text" placeholder="Ex: 12" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Outras Despesas (R$)</label>
                      <input name="otherExpenses" value={osFormState.otherExpenses || ''} onChange={(e) => setOsFormState(prev => ({ ...prev, otherExpenses: parseFloat(e.target.value) || 0 }))} type="number" step="0.01" placeholder="0.00" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-emerald-700 mb-1">Valor do Frete Bruto (R$)</label>
                      <input name="freightValue" type="number" step="0.01" readOnly value={osFreightValue > 0 ? osFreightValue.toFixed(2) : ''} placeholder="0.00" className="w-full bg-emerald-50 rounded border border-emerald-200 px-3 py-2 text-emerald-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-rose-700 mb-1">Comissão Transportadora (15%)</label>
                      <input name="carrierCommission" type="number" step="0.01" readOnly value={osFreightValue > 0 ? (osFreightValue * 0.15).toFixed(2) : ''} placeholder="0.00" className="w-full bg-rose-50 rounded border border-rose-200 px-3 py-2 text-rose-900 focus:outline-none cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-emerald-700 mb-1">Pagar ao Motorista (R$)</label>
                      <input name="driverPayment" type="number" step="0.01" readOnly value={osFreightValue > 0 ? (osFreightValue * 0.85).toFixed(2) : ''} placeholder="0.00" className="w-full bg-emerald-100 rounded border border-emerald-300 px-3 py-2 text-emerald-900 font-bold focus:outline-none cursor-not-allowed" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Data e Hora da OS</label>
                      <input name="createdAt" type="datetime-local" defaultValue={getLocalDatetimeForInput(new Date().toISOString())} className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="bg-emerald-100 border border-emerald-300 p-2 md:p-4 rounded-xl flex items-center justify-between mt-2">
                    <span className="font-bold text-emerald-800">Frete Total da OS</span>
                    <span className="font-bold text-xl md:text-2xl text-emerald-900">R$ {(osTotalValue > 0 ? osTotalValue : 0).toFixed(2).replace('.', ',')}</span>
                  </div>
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
                    <p className="text-[#ff3b00] font-bold text-base md:text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(osTotalValue)}</p>
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
                      <span className="text-slate-600 font-semibold">Pedágio</span>
                      <span className="text-slate-900 font-bold">R$ {osTollValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-600 font-semibold">Pedágio por eixo</span>
                      <span className="text-slate-900 font-bold">R$ {(osFormState.tollPerAxle).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-600 font-semibold">Combustível</span>
                      <span className="text-slate-900 font-bold">R$ {(routeParams.kmL > 0 ? (osFormState.distance / routeParams.kmL) * routeParams.dieselPrice : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center bg-slate-50 -mx-4 -mb-3 md:mb-4 p-2 md:p-4">
                      <span className="text-slate-800 font-bold">Custo Total</span>
                      <span className="text-slate-900 font-black text-base md:text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(osTotalValue)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'OS_LIST' && (
          <div className="p-3 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 tracking-tight">Ordens de Serviço</h2>
                <p className="text-slate-500 mt-2 font-medium">Histórico e acompanhamento de OS.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <FileText size={18} /> <span className="hidden md:inline">Relatório PDF</span>
                </button>
                <button 
                  onClick={() => {
                    
                    setEditingOs(null);
                    setActiveTab('OS_CREATE');
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus size={18} /> Nova OS
                </button>
              </div>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-2xl border border-slate-200 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter size={18} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">Filtros</span>
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
                  <select 
                    value={osStatusFilter}
                    onChange={(e) => setOsStatusFilter(e.target.value)}
                    className="w-full md:w-40 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm text-slate-700"
                  >
                    <option value="">Status</option>
                    <option value="PENDING_APPROVAL">Pendente</option>
                    <option value="APPROVED">Aprovada</option>
                    <option value="IN_TRANSIT">Em Trânsito</option>
                    <option value="COMPLETED">Finalizada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                  <input 
                    type="date"
                    value={osDateFrom}
                    onChange={(e) => setOsDateFrom(e.target.value)}
                    className="w-full md:w-36 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm text-slate-700"
                  />
                  <input 
                    type="date"
                    value={osDateTo}
                    onChange={(e) => setOsDateTo(e.target.value)}
                    className="w-full md:w-36 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm text-slate-700"
                  />
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Nº OS ou Placa..."
                      value={osSearch}
                      onChange={(e) => setOsSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
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
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm md:text-base">#{os.number}</span>
                          <span className="text-xs text-slate-500 hidden md:inline">{new Date(os.createdAt).toLocaleDateString('pt-BR')} - {new Date(os.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="hidden md:flex flex-col border-l border-slate-200 pl-4">
                            <span className="text-sm font-semibold text-slate-800">{os.clientName || 'Cliente Indefinido'}</span>
                            <span className="text-xs text-slate-500">Mot: {os.driverName || 'Sem motorista'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-bold text-indigo-600 block text-sm md:text-base">{formatBRL(os.netValue)}</span>
                          <span className="text-[10px] md:text-xs text-slate-500 hidden md:block">Total Bruto: {formatBRL((os as any).totalValue || (os.grossValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0))}</span>
                        </div>
                        <span className={`text-[10px] md:text-xs font-semibold rounded-full px-2 py-1 md:px-3 ${
                          os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          os.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 
                          os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">KM Total / Peso</p>
                      <p className="font-semibold text-slate-900">{os.kmTotal} km / {os.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Líquido Motorista</p>
                      <p className="font-semibold text-indigo-600">{formatBRL(os.netValue)}</p>
                    </div>
                    <div className="col-span-2 md:col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Status de Pagamentos</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          Cliente: {os.paymentStatusClient === 'PAID' ? 'Recebido' : 'Pendente'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${os.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          Motorista: {os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'}
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
            </div>
          </div>
        )}

        {activeTab === 'PRICING_TABLE' && (
          <PricingTable 
            tiers={pricingTiers} 
            excess={pricingExcess} 
            onSave={handleSavePricing} 
            onBack={() => setActiveTab('OS_CREATE')}
          />
        )}

        
        
        {activeTab === 'CLIENT_DETAIL' && selectedClientId && (
          <ClientDetailView 
            clientId={selectedClientId} 
            clients={clients} 
            orders={orders} 
            onBack={() => {
              setSelectedClientId(null);
              setActiveTab('CLIENT_LIST');
            }} 
            onEditOs={setEditingOs}
            onDeleteOs={handleDeleteOs}
            onGenerateStatement={(selectedOses, targetName, targetDocument) => {
              setStatementData({
                 orders: selectedOses,
                 role: 'ADMIN_TO_CLIENT',
                 targetName,
                 targetDocument
              });
            }}
          />
        )}

        {activeTab === 'CLIENT_LIST' && (
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
        )}

        {activeTab === 'DRIVER_LIST' && (
          <div className="p-3 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 tracking-tight">Motoristas e Frota</h2>
                <p className="text-slate-500 mt-2 font-medium">Gerencie sua equipe, veículos e acertos financeiros.</p>
              </div>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-2xl border border-slate-200 mb-6 shadow-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, placa ou CPF..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              {drivers.filter(d => {
                const s = driverSearch.toLowerCase();
                return d.name.toLowerCase().includes(s) || 
                       d.cpf.toLowerCase().includes(s) || 
                       d.vehiclePlateHorse.toLowerCase().includes(s);
              }).length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Nenhum motorista encontrado.
                </div>
              ) : drivers.filter(d => {
                const s = driverSearch.toLowerCase();
                return d.name.toLowerCase().includes(s) || 
                       d.cpf.toLowerCase().includes(s) || 
                       d.vehiclePlateHorse.toLowerCase().includes(s);
              }).map(driver => (
                <ExpandableCard
                  key={driver.id}
                  id={driver.id!}
                  isExpanded={!!expandedDriverIds[driver.id!]}
                  onToggle={toggleDriverExpanded}
                  header={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg hidden md:flex">
                          {driver.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm md:text-lg">{driver.name}</span>
                          <span className="text-xs text-slate-500">{driver.vehicleType || 'Não Informado'} • Placa: {driver.vehiclePlateHorse}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-semibold rounded-full border border-emerald-200">
                          Online
                        </span>
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Documento (CPF)</p>
                      <p className="font-medium text-slate-900">{driver.cpf || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</p>
                      <p className="font-medium text-slate-900">{driver.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Veículo / Tipo</p>
                      <p className="font-medium text-slate-900">{driver.vehicleType || 'Não Informado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setFinanceDriverId(driver.id); 
                        setSelectedDriverId(driver.id);
                        setActiveTab('DRIVER_DETAIL'); 
                      }} 
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <CreditCard size={18} /> Acerto Financeiro
                    </button>
                    <div className="w-full md:w-auto flex-1 md:ml-auto flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                      >
                        <UserPlus size={18} /> Abrir Perfil
                      </button>
                    </div>
                  </div>
                </ExpandableCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'DRIVER_DETAIL' && selectedDriverId && (
          <DriverDetailView 
            driverId={selectedDriverId}
            drivers={drivers}
            orders={orders}
            onBack={() => {
              setSelectedDriverId(null);
              setActiveTab('DRIVER_LIST');
            }} 
            onPrintOs={setPrintOs}
            onSendOsWhatsApp={sendOsWhatsApp}
            onEditOs={setEditingOs}
            onDeleteOs={handleDeleteOs}
            onGenerateStatement={(selectedOses, driver) => {
              setStatementData({
                 orders: selectedOses,
                 role: 'ADMIN_TO_DRIVER',
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
          />
        )}

        </div>
      </div>
    </div>
  );
}

function SidebarButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  const handleClick = () => {
    onClick();
  };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DriverDetailView({ driverId, drivers, orders, onBack, onPrintOs, onSendOsWhatsApp, onGenerateStatement , onEditOs, onDeleteOs}: { driverId: string, drivers: Driver[], orders: OrderService[], onBack: () => void, onPrintOs: (os: any) => void, onSendOsWhatsApp: (os: any) => void, onGenerateStatement: (oses: OrderService[], driver: Driver) => void , onEditOs: (os: any) => void, onDeleteOs: (id: string) => void}) {
  const [isEditing, setIsEditing] = useState(false);
  const [detailTab, setDetailTab] = useState<'INFO' | 'FINANCE'>('FINANCE');
  const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});
    const driver = drivers.find(d => d.id === driverId);
  
  if (!driver) return null;

  const driverOrders = orders.filter(o => o.driverId === driverId);
  const totalNet = driverOrders.reduce((acc, os) => acc + os.netValue, 0);

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este motorista? Esta ação é irreversível.')) {
        try {
          await deleteDoc(doc(db, 'drivers', driver.id));
          toast.success('Motorista excluído com sucesso.');
          onBack();
        } catch (error) {
          console.error("Error deleting driver: ", error);
          toast.error('Erro ao excluir motorista.');
        }
    }
  };

  


  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    try {
      btn.innerText = 'Salvando...';
      btn.disabled = true;

      const updateData = {
        name: (form.elements.namedItem('name') as HTMLInputElement).value,
        cpf: (form.elements.namedItem('cpf') as HTMLInputElement).value,
        phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
        cnhExpiry: (form.elements.namedItem('cnhExpiry') as HTMLInputElement).value,
        rntrcExpiry: (form.elements.namedItem('rntrcExpiry') as HTMLInputElement).value,
        vehicleType: (form.elements.namedItem('vehicleType') as HTMLInputElement).value,
        vehiclePlateHorse: (form.elements.namedItem('vehiclePlateHorse') as HTMLInputElement).value,
        vehiclePlateTrailer: (form.elements.namedItem('vehiclePlateTrailer') as HTMLInputElement).value,
        axes: parseInt((form.elements.namedItem('axes') as HTMLInputElement).value) || 3,
        capacityWeight: (form.elements.namedItem('capacityWeight') as HTMLInputElement).value,
        bodyType: (form.elements.namedItem('bodyType') as HTMLInputElement).value,
        yearModel: (form.elements.namedItem('yearModel') as HTMLInputElement).value,
        pixKey: (form.elements.namedItem('pixKey') as HTMLInputElement).value,
        pixKeyType: (form.elements.namedItem('pixKeyType') as HTMLInputElement).value,
        bank: (form.elements.namedItem('bank') as HTMLInputElement).value,
        agency: (form.elements.namedItem('agency') as HTMLInputElement).value,
        account: (form.elements.namedItem('account') as HTMLInputElement).value,
      };

      await updateDoc(doc(db, 'drivers', driver.id), updateData);
      toast.success('Motorista atualizado com sucesso.');
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating driver: ", error);
      toast.error('Erro ao atualizar motorista.');
    } finally {
      btn.innerText = 'Salvar Alterações';
      btn.disabled = false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-300 pb-12">
      <div className="flex justify-between items-center mb-3 md:mb-4 md:mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Voltar para Lista
        </button>
      </div>

      <div className="bg-white rounded-lg md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-3 md:mb-4 md:mb-8">
        <div className="p-3 md:p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display">{driver.name}</h2>
            <p className="text-slate-500 font-medium mt-1">Placa: {driver.vehiclePlateHorse} | Veículo: {driver.vehicleType}</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button onClick={() => setDetailTab('INFO')} className={`px-3 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${detailTab === 'INFO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
              Dados Cadastrais
            </button>
            <button onClick={() => setDetailTab('FINANCE')} className={`px-3 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${detailTab === 'FINANCE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
              Financeiro & OS
            </button>
          </div>
        </div>

        {detailTab === 'INFO' && (
          <div className="p-3 md:p-8">
            <div className="flex justify-end gap-3 mb-3 md:mb-4 md:mb-6">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 font-medium px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors ${
                  isEditing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {isEditing ? 'Cancelar Edição' : <><Edit size={18} /> Editar Motorista</>}
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 bg-red-50/50 font-medium px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors border border-red-100"
              >
                <Trash2 size={18} /> Excluir
              </button>
            </div>
            
            {isEditing ? (

        <form onSubmit={handleEditSubmit} className="bg-white rounded-lg md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-3 md:mb-4 md:mb-8 p-3 md:p-8">
          <h2 className="text-xl md:text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 md:mb-6">Editar Dados do Motorista</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-2 md:gap-6 mb-3 md:mb-4 md:mb-8">
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Dados Pessoais</h3>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input name="name" defaultValue={driver.name} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">CPF</label>
                  <input name="cpf" defaultValue={driver.cpf} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Celular</label>
                  <input name="phone" defaultValue={driver.phone} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Senha de Acesso</label>
                <div className="flex gap-2">
                  <input name="password" defaultValue={driver.password || ''} className="flex-1 px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Deixe em branco para não alterar" />
                  <button 
                    type="button" 
                    onClick={() => {
                      const form = document.querySelector('form') as HTMLFormElement;
                      if (!form) return;
                      const pwdInput = form.querySelector('input[name="password"]') as HTMLInputElement;
                      const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
                      const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
                      
                      const pwd = pwdInput?.value || driver.password;
                      let p = (phoneInput?.value || driver.phone).replace(/\D/g, '');
                      
                      if (!pwd || !p) {
                        toast.error("Preencha o celular e a senha para enviar.");
                        return;
                      }
                      
                      if (p.length === 10 || p.length === 11) p = '55' + p;
                      const msg = `Olá ${nameInput?.value || driver.name}! Sua senha de acesso ao sistema Qualp é: ${pwd}`;
                      window.open(`https://wa.me/${p}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2"
                    title="Enviar senha por WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Validade CNH</label>
                  <input name="cnhExpiry" type="date" defaultValue={driver.cnhExpiry} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Validade RNTRC</label>
                  <input name="rntrcExpiry" type="date" defaultValue={driver.rntrcExpiry} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Dados do Veículo</h3>
              <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Tipo de Veículo</label>
                  <input name="vehicleType" defaultValue={driver.vehicleType} className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Eixos</label>
                  <input name="axes" type="number" defaultValue={driver.axes} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Placa Cavalo</label>
                  <input name="vehiclePlateHorse" defaultValue={driver.vehiclePlateHorse} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Placa Carreta</label>
                  <input name="vehiclePlateTrailer" defaultValue={driver.vehiclePlateTrailer} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Capacidade/Peso</label>
                  <input name="capacityWeight" defaultValue={driver.capacityWeight} placeholder="Ex: 3.500 kg" className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Carroceria</label>
                  <input name="bodyType" defaultValue={driver.bodyType} placeholder="Ex: Baú" className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Ano/Modelo</label>
                  <input name="yearModel" defaultValue={driver.yearModel} placeholder="Ex: 2022/2022" className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3 md:space-y-4 md:col-span-2">
              <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Dados Bancários</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Tipo Chave PIX</label>
                  <input name="pixKeyType" defaultValue={driver.pixKeyType} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Chave PIX</label>
                  <input name="pixKey" defaultValue={driver.pixKey} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Banco</label>
                  <input name="bank" defaultValue={driver.bank} required className="w-full px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Agência/Conta</label>
                  <div className="flex gap-2">
                    <input name="agency" defaultValue={driver.agency} placeholder="Ag" className="w-1/3 px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                    <input name="account" defaultValue={driver.account} placeholder="Conta" className="w-2/3 px-3 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
              <CheckCircle2 size={20} /> Salvar Alterações
            </button>
          </div>
        
            </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-4 md:gap-8">
                {/* Visualização de dados, igual ao que já existia ou podemos abstrair, o que estava antes do isEditing no original era so um if e ja ia pros forms... */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Dados Pessoais</h3>
                  <div><span className="text-slate-500 text-xs md:text-sm">Nome:</span> <p className="font-semibold">{driver.name}</p></div>
                  <div><span className="text-slate-500 text-xs md:text-sm">CPF:</span> <p className="font-semibold">{driver.cpf}</p></div>
                  <div><span className="text-slate-500 text-xs md:text-sm">Celular:</span> <p className="font-semibold">{driver.phone}</p></div>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Dados Bancários</h3>
                  <div><span className="text-slate-500 text-xs md:text-sm">Chave PIX:</span> <p className="font-semibold">{driver.pixKey} ({driver.pixKeyType})</p></div>
                  <div><span className="text-slate-500 text-xs md:text-sm">Banco:</span> <p className="font-semibold">{driver.bank}</p></div>
                  <div><span className="text-slate-500 text-xs md:text-sm">Agência/Conta:</span> <p className="font-semibold">{driver.agency} / {driver.account}</p></div>
                </div>
              </div>
            )}
          </div>
        )}

        {detailTab === 'FINANCE' && (
          <div className="p-3 md:p-8 bg-slate-50">
             
             
             <div className="flex justify-between items-end mb-3 md:mb-4 md:mb-6">
                <div>
                   <h3 className="text-lg md:text-xl font-bold text-slate-900">Histórico de Corridas</h3>
                   <p className="text-xs md:text-sm text-slate-500">Selecione as OSs pendentes para fechamento.</p>
                </div>
                <div className="flex items-center gap-3">
                    {driverOrders.filter(o => selectedOsIds[o.id!]).length > 0 && (
                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm">
                        📝 {driverOrders.filter(o => selectedOsIds[o.id!]).length} OSs selecionadas — Total: {formatBRL(driverOrders.filter(o => selectedOsIds[o.id!]).reduce((acc, os) => acc + (os.netValue || 0), 0))}
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        const selected = driverOrders.filter(o => selectedOsIds[o.id!]);
                        if (selected.length === 0) return toast.error('Selecione pelo menos uma OS');
                        onGenerateStatement(selected, driver);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-bold flex items-center gap-2 transition-colors shadow-sm"
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
                          await updateDoc(doc(db, 'orders', os.id!), { paymentStatusDriver: 'PAID', driverPaymentStatus: 'Pago' });
                        }
                        import('sonner').then(({toast}) => toast.success('Pagamento confirmado!'));
                        setSelectedOsIds({});
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={16} /> Fechar Pagamento
                    </button>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 md:px-4 md:py-3 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
                          onChange={e => {
                            const val = e.target.checked;
                            const newSelection = {...selectedOsIds};
                            driverOrders.filter(o => o.paymentStatusDriver !== 'PAID').forEach(o => newSelection[o.id!] = val);
                            setSelectedOsIds(newSelection);
                          }}
                        />
                      </th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold">OS</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold">Data</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold">Rota</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold text-right">Valor Líquido</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold text-center">Status Pgto</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {driverOrders.map(os => (
                      <tr key={os.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 md:px-4 md:py-3 text-center">
                          <input type="checkbox" disabled={os.paymentStatusDriver === 'PAID'} checked={!!selectedOsIds[os.id!]}
                            onChange={e => setSelectedOsIds({...selectedOsIds, [os.id!]: e.target.checked})}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-3 py-2 md:px-4 md:py-3 font-bold text-slate-800">#{os.number}</td>
                        <td className="px-3 py-2 md:px-4 md:py-3 text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-3 py-2 md:px-4 md:py-3 text-slate-700 max-w-[200px]">{os.origin.split(',')[0]} → {os.destinations?.[0]?.split(',')[0]}</td>
                        <td className="px-3 py-2 md:px-4 md:py-3 font-bold text-indigo-700 text-right">{formatBRL(os.netValue || 0)}</td>
                        <td className="px-3 py-2 md:px-4 md:py-3 text-center">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${os.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>

                        <td className="px-3 py-2 md:px-4 md:py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => onEditOs(os)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Editar"><Edit size={16} /></button>
                            <button onClick={() => onDeleteOs(os.id!)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir Definitivamente"><Trash2 size={16} /></button>
                          </div>
                        </td>

                      </tr>
                    ))}
                    {driverOrders.length === 0 && <tr><td colSpan={7} className="p-3 md:p-8 text-center text-slate-500">Nenhuma OS encontrada</td></tr>}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}



function ClientDetailView({ clientId, clients, orders, onBack, onGenerateStatement , onEditOs, onDeleteOs}: { clientId: string, clients: Client[], orders: OrderService[], onBack: () => void, onGenerateStatement: (oses: OrderService[], name: string, doc: string) => void , onEditOs: (os: any) => void, onDeleteOs: (id: string) => void}) {
  const [detailTab, setDetailTab] = useState<'INFO' | 'FINANCE'>('FINANCE');
  const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});
  const client = clients.find(c => c.id === clientId);
  
  if (!client) return null;
  const clientOrders = orders.filter(o => o.clientId === clientId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-300 pb-12">
      <div className="flex justify-between items-center mb-3 md:mb-4 md:mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Voltar para Lista
        </button>
      </div>

      <div className="bg-white rounded-lg md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-3 md:mb-4 md:mb-8">
        <div className="p-3 md:p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display">{client.name}</h2>
            <p className="text-slate-500 font-medium mt-1">CNPJ/CPF: {client.document}</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button onClick={() => setDetailTab('INFO')} className={`px-3 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${detailTab === 'INFO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
              Dados Cadastrais
            </button>
            <button onClick={() => setDetailTab('FINANCE')} className={`px-3 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${detailTab === 'FINANCE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
              Financeiro & OS
            </button>
          </div>
        </div>

        {detailTab === 'INFO' && (
          <div className="p-3 md:p-8">
            <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 md:mb-4 border-b pb-2">Informações do Cliente</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-2 md:gap-6">
              <div>
                <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider mb-1">Nome/Razão Social</p>
                <p className="font-semibold text-slate-900">{client.name}</p>
              </div>
              <div>
                <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider mb-1">Documento</p>
                <p className="font-semibold text-slate-900">{client.document}</p>
              </div>
              <div>
                <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider mb-1">Telefone</p>
                <p className="font-semibold text-slate-900">{client.phone}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-8 pt-6 border-t border-slate-100 text-right">
                <span className="text-xs md:text-sm text-slate-400">O status operacional do motorista é checado automaticamente pelas validades.</span>
            </div>
          </div>
        )}

        {detailTab === 'FINANCE' && (
          <div className="p-3 md:p-8 bg-slate-50">
             
             <div className="flex justify-between items-end mb-3 md:mb-4 md:mb-6">
                <div>
                   <h3 className="text-lg md:text-xl font-bold text-slate-900">Histórico e Faturamento</h3>
                   <p className="text-xs md:text-sm text-slate-500">Selecione as OSs pendentes para gerar fatura ou marcar como recebido.</p>
                </div>
                <div className="flex items-center gap-3">
                    {clientOrders.filter(o => selectedOsIds[o.id!]).length > 0 && (
                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm">
                        📝 {clientOrders.filter(o => selectedOsIds[o.id!]).length} OSs selecionadas — Total: {formatBRL(clientOrders.filter(o => selectedOsIds[o.id!]).reduce((acc, os) => acc + (os.totalValue || 0), 0))}
                      </div>
                    )}
                   <button 
                      onClick={() => {
                        const selected = clientOrders.filter(o => selectedOsIds[o.id!]);
                        if (selected.length === 0) return toast.error('Selecione pelo menos uma OS');
                        onGenerateStatement(selected, client.name, client.document);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <FileText size={16} /> Exibir Relatório
                    </button>
                    <button 
                      onClick={async () => {
                        const selected = clientOrders.filter(o => selectedOsIds[o.id!] && o.paymentStatusClient !== 'PAID');
                        if (selected.length === 0) return toast.error('Selecione OSs pendentes');
                        for (const os of selected) {
                          const { updateDoc, doc } = await import('firebase/firestore');
                          const { db } = await import('../firebase');
                          await updateDoc(doc(db, 'orders', os.id!), { paymentStatusClient: 'PAID', clientPaymentStatus: 'Pago' });
                        }
                        import('sonner').then(({toast}) => toast.success('Recebimento confirmado!'));
                        setSelectedOsIds({});
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={16} /> Marcar Recebido
                    </button>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 md:px-4 md:py-3 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
                          onChange={e => {
                            const val = e.target.checked;
                            const newSelection = {...selectedOsIds};
                            clientOrders.filter(o => o.paymentStatusClient !== 'PAID').forEach(o => newSelection[o.id!] = val);
                            setSelectedOsIds(newSelection);
                          }}
                        />
                      </th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold">OS</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold">Data</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold">Rota</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold text-right">Valor</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold text-center">Status</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientOrders.map(os => (
                      <tr key={os.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 md:px-4 md:py-3 text-center">
                          <input type="checkbox" disabled={os.paymentStatusClient === 'PAID'} checked={!!selectedOsIds[os.id!]}
                            onChange={e => setSelectedOsIds({...selectedOsIds, [os.id!]: e.target.checked})}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-3 py-2 md:px-4 md:py-3 font-bold text-slate-800">#{os.number}</td>
                        <td className="px-3 py-2 md:px-4 md:py-3 text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-3 py-2 md:px-4 md:py-3 text-slate-700 max-w-[200px]">{os.origin.split(',')[0]} → {os.destinations?.[0]?.split(',')[0]}</td>
                        <td className="px-3 py-2 md:px-4 md:py-3 font-bold text-indigo-700 text-right">{formatBRL(os.totalValue || 0)}</td>
                        <td className="px-3 py-2 md:px-4 md:py-3 text-center">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {os.paymentStatusClient === 'PAID' ? 'Recebido' : 'Pendente'}
                          </span>
                        </td>

                        <td className="px-3 py-2 md:px-4 md:py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => onEditOs(os)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Editar"><Edit size={16} /></button>
                            <button onClick={() => onDeleteOs(os.id!)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir Definitivamente"><Trash2 size={16} /></button>
                          </div>
                        </td>

                      </tr>
                    ))}
                    {clientOrders.length === 0 && <tr><td colSpan={7} className="p-3 md:p-8 text-center text-slate-500">Nenhuma OS encontrada</td></tr>}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
