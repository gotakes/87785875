const fs = require('fs');
const filepath = 'src/components/Driver.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const startStr = `  const renderOrderCard = (order: OrderService) => (`;
const startIndex = content.indexOf(startStr);

let braceCount = 0;
let endIndex = -1;
for (let i = startIndex + startStr.length; i < content.length; i++) {
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

    const newBlock = `  const renderOrderCard = (order: OrderService) => (
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
                <span className={\`text-[10px] md:text-xs font-semibold px-2 py-1 md:px-3 rounded-full \${order.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}\`}>
                  {order.status === 'IN_TRANSIT' ? 'Em Rota' : order.status === 'APPROVED' ? 'Aprovado' : 'Pendente'}
                </span>
              ) : (
                <span className={\`text-[10px] md:text-xs font-semibold px-2 py-1 md:px-3 rounded-full \${order.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
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
          onClick={() => { setActiveTab('MAP'); setMobileMenuOpen(false); }}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
        >
          <Map size={18} /> Abrir Mapa
        </button>
        <button 
          onClick={() => window.open(\`https://wa.me/?text=Status da OS %23\${order.number}: \${order.status === 'COMPLETED' ? 'Finalizada' : 'Em Andamento'}\`, '_blank')}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
        >
          <MessageCircle size={18} /> Reportar
        </button>
      </div>
    </ExpandableCard>
  )`;

    fs.writeFileSync(filepath, content.replace(originalBlock, newBlock));
    console.log("Successfully replaced renderOrderCard in Driver");
} else {
    console.log("Could not find bounds of renderOrderCard in Driver");
}
