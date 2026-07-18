import re

with open('src/components/Admin.tsx', 'r') as f:
    content = f.read()

edit_modal_code = """
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
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Editar OS #{os.number}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={handleEditOsSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
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
              <label className="block text-sm font-medium mb-1">Data/Hora (Opcional)</label>
              <input type="datetime-local" name="createdAt" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Motorista</label>
              <select name="driverId" defaultValue={os.driverId || ''} className="w-full border rounded-lg px-3 py-2">
                <option value="">Sem motorista</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Origem (Início)</label>
              <input name="origin" defaultValue={os.origin} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Distância (KM)</label>
              <input name="distanceKm" type="number" step="0.1" defaultValue={os.distanceKm} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor Bruto (R$)</label>
              <input name="grossValue" type="number" step="0.01" defaultValue={os.grossValue} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comissão (R$)</label>
              <input name="carrierCommission" type="number" step="0.01" defaultValue={os.carrierCommission || 0} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Líquido (R$)</label>
              <input name="netValue" type="number" step="0.01" defaultValue={os.netValue} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pedágio (R$)</label>
              <input name="tollCost" type="number" step="0.01" defaultValue={os.tollCost || 0} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Outras Desp. (R$)</label>
              <input name="otherExpenses" type="number" step="0.01" defaultValue={os.otherExpenses || 0} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea name="observations" defaultValue={os.observations || ''} className="w-full border rounded-lg px-3 py-2" rows={3}></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
}
"""

if "function EditOsModal" not in content:
    content = content.replace("export default function AdminPanel", edit_modal_code + "\nexport default function AdminPanel")
    with open('src/components/Admin.tsx', 'w') as f:
        f.write(content)
