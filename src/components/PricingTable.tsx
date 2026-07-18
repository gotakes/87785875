import React, { useState } from 'react';
import { PricingTier, PricingExcess, defaultPricingTiers, defaultPricingExcess } from '../lib/pricing';
import { Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PricingTableProps {
  tiers: PricingTier[];
  excess: PricingExcess;
  onSave: (tiers: PricingTier[], excess: PricingExcess) => void;
  onBack?: () => void;
}

export default function PricingTable({ tiers, excess, onSave, onBack }: PricingTableProps) {
  const [localTiers, setLocalTiers] = useState<PricingTier[]>(JSON.parse(JSON.stringify(tiers)));
  const [localExcess, setLocalExcess] = useState<PricingExcess>({ ...excess });

  const handleSave = () => {
    onSave(localTiers, localExcess);
    toast.success('Tabela de preços salva com sucesso!');
  };

  const handleReset = () => {
    setLocalTiers(JSON.parse(JSON.stringify(defaultPricingTiers)));
    setLocalExcess({ ...defaultPricingExcess });
    toast.info('Tabela redefinida para os padrões. Clique em Salvar para confirmar.');
  };

  const handlePriceChange = (index: number, vehicle: keyof PricingExcess, value: string) => {
    const newTiers = [...localTiers];
    newTiers[index].prices[vehicle] = parseFloat(value) || 0;
    setLocalTiers(newTiers);
  };

  const handleExcessChange = (vehicle: keyof PricingExcess, value: string) => {
    setLocalExcess({ ...localExcess, [vehicle]: parseFloat(value) || 0 });
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Voltar para Precificação"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Matriz de Tarifas (Tabela de Preços)</h2>
            <p className="text-slate-500">Valores de frete por faixas de Km e tipo de veículo.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={18} />
            Restaurar Padrão
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Save size={18} />
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap sticky left-0 bg-slate-50 z-10 border-r">Faixa Km (Ida+Volta)</th>
                <th className="px-4 py-3 font-semibold">PASSEIO</th>
                <th className="px-4 py-3 font-semibold">FIORINO</th>
                <th className="px-4 py-3 font-semibold">VAN/HR</th>
                <th className="px-4 py-3 font-semibold">VUC</th>
                <th className="px-4 py-3 font-semibold">MÉDIO</th>
                <th className="px-4 py-3 font-semibold">TOCO</th>
                <th className="px-4 py-3 font-semibold">TRUCK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localTiers.map((tier, idx) => (
                <tr key={tier.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r">
                    {tier.label}
                  </td>
                  {(['passeio', 'fiorino', 'van', 'vuc', 'medio', 'toco', 'truck'] as Array<keyof PricingExcess>).map(v => (
                    <td key={v} className="px-4 py-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={tier.prices[v]}
                          onChange={(e) => handlePriceChange(idx, v, e.target.value)}
                          className="w-32 pl-7 pr-2 py-1.5 text-right border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-amber-50/50 hover:bg-amber-50 transition-colors">
                <td className="px-4 py-4 font-bold text-amber-800 whitespace-nowrap sticky left-0 bg-amber-50/50 z-10 border-r">
                  Excedente/Km (&gt; 1000)
                </td>
                {(['passeio', 'fiorino', 'van', 'vuc', 'medio', 'toco', 'truck'] as Array<keyof PricingExcess>).map(v => (
                  <td key={v} className="px-4 py-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-600/60 text-xs">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={localExcess[v]}
                        onChange={(e) => handleExcessChange(v, e.target.value)}
                        className="w-32 pl-7 pr-2 py-1.5 text-right border border-amber-200 rounded text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm font-bold bg-white"
                      />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
