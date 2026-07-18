import React, { useState } from 'react';
import { OrderService, Driver } from '../types';
import { FileText, MessageCircle, Globe, Truck, ArrowLeft, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface PrintOsModalProps {
  userRole?: 'ADMIN' | 'DRIVER' | 'CLIENT';
  printOs: OrderService;
  onClose: () => void;
  onWhatsApp?: () => void;
}

export default function PrintOsModal({ printOs, onClose, onWhatsApp, userRole = 'ADMIN' }: PrintOsModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string, title: string } | null>(null);

    const openInNewWindowAndPrint = (elementId: string, title: string) => {
    const content = document.getElementById(elementId);
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Por favor, permita pop-ups neste site para abrir a impressão.");
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          ${styles}
          <style>
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print\\:hidden { display: none !important; }
            }
            body { font-family: sans-serif; background: white; margin: 0; padding: 20px; }
            .print\\:hidden { display: none !important; }
            #${elementId} { display: block !important; }
          </style>
        </head>
        <body>
          ${content.outerHTML}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPdf = (openWhatsApp = false) => {
    openInNewWindowAndPrint('print-os-content', `OS_${printOs.number}`);
    if (openWhatsApp && onWhatsApp) {
      onWhatsApp();
    }
  };
  
  const handleDownloadPhotoPdf = () => {
    if (!selectedPhoto) return;
    openInNewWindowAndPrint('print-photo-content', `Anexo_${selectedPhoto.title}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto print:bg-white flex flex-col">
      {selectedPhoto && (
        <div className="fixed inset-0 z-[10000] bg-white flex flex-col">
          <div className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 p-4 flex justify-between items-center shadow-sm print:hidden">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedPhoto(null)} className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
                <ArrowLeft size={18} /> Voltar
              </button>
              <h3 className="font-bold text-slate-900">{selectedPhoto.title}</h3>
            </div>
            <button 
              onClick={handleDownloadPhotoPdf} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Printer size={18} /> Salvar
            </button>
          </div>
          <div id="print-photo-content" className="flex-1 p-8 flex items-center justify-center print:p-0 print:block bg-white w-full h-full">
            <img src={selectedPhoto.url} crossOrigin="anonymous" alt={selectedPhoto.title} className="max-w-full max-h-[85vh] object-contain print:max-h-none print:w-full print:h-auto" />
          </div>
        </div>
      )}

      <div className={`sticky top-0 z-[100] bg-slate-100 border-b border-slate-200 p-4 flex justify-between items-center shadow-sm print:hidden ${selectedPhoto ? 'hidden' : ''}`}>
        <h3 className="font-bold text-slate-900">Visualização de Impressão (OS #{printOs.number})</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => handleDownloadPdf()} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <FileText size={18} /> Salvar
          </button>
          <button onClick={onClose} className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
            Fechar
          </button>
        </div>
      </div>

      <div id="print-os-content" className={`p-8 print:p-0 bg-white ${selectedPhoto ? 'hidden print:hidden' : ''}`}>
        <div className="flex justify-between items-center border-b-2 border-blue-900 pb-2 mb-2 print:pb-1 print:mb-1">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="El Nathan Transportes" className="h-20 print:h-14 w-auto object-contain" />
          </div>
          <div className="text-right text-blue-900">
            <h2 className="text-lg print:text-base font-bold uppercase">Ordem de Serviço</h2>
            <p className="text-2xl print:text-lg font-black">{printOs.number}</p>
          </div>
        </div>

        <div className="mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">1. INFORMAÇÕES DO MOTORISTA / VEÍCULO</div>
          <div className="grid grid-cols-3 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Motorista:</span><span className="font-bold">{printOs.driverName || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">CPF:</span><span className="font-bold">{printOs.driverCpf || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Celular:</span><span className="font-bold">{printOs.driverPhone || 'N/A'}</span></div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-blue-900 border-t border-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Placa do Veículo:</span><span className="font-bold">{printOs.driverPlate || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Tipo:</span><span className="font-bold">{printOs.vehicleType || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Capacidade / Tara:</span><span className="font-bold">{printOs.capacityWeight || '-'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Carroceria:</span><span className="font-bold">{printOs.bodyType || '-'}</span></div>
          </div>
        </div>

        <div className="mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">2. ROTA E CARGA</div>
          <div className="grid grid-cols-2 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Origem (Coleta):</span><span className="font-bold">{printOs.origin}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Destino (Entrega):</span><span className="font-bold">{printOs.destinations?.join('; ') || 'N/A'}</span></div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-blue-900 border-t border-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Natureza da Carga:</span><span className="font-bold">{printOs.cargoType || 'Diversos'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Peso Estimado (Kg):</span><span className="font-bold">{printOs.estimatedWeight || '-'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Volumetria (M³):</span><span className="font-bold">{printOs.cargoVolume || '-'}</span></div>
          </div>
        </div>
        <div className="mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">3. QUILOMETRAGEM E OBSERVAÇÕES</div>
          <div className="grid grid-cols-2 divide-x divide-blue-900 border-b border-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">KM Previsto (ida e volta):</span><span className="font-bold">{printOs.distanceKm} km</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">KM Final (Realizado):</span><span className="font-bold">-</span></div>
          </div>
          <div className="p-2 text-xs print:text-[10px] leading-tight">
            <span className="text-gray-600 block">Observações:</span>
            <span className="font-bold">{printOs.observations || 'Nenhuma observação.'}</span>
          </div>
        </div>

        <div className="mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">4. VALORES</div>
          
          {userRole === 'DRIVER' ? (
            <div className="grid grid-cols-1 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight text-center">
              <div className="p-2 print:p-1 bg-emerald-50">
                <span className="text-gray-600 block">LÍQUIDO DO MOTORISTA:</span>
                <span className="font-bold text-base print:text-sm print:text-xs text-emerald-700">R$ {(printOs.netValue || 0).toFixed(2).replace('.',',')}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 divide-x divide-blue-900 border-b border-blue-900 text-xs print:text-[10px] leading-tight text-center">
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Valor do Frete Bruto:</span><span className="font-bold">R$ {printOs.grossValue?.toFixed(2).replace('.',',')}</span></div>
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Pedágio:</span><span className="font-bold">{printOs.axles || 1} Eixo(s) x R$ {(printOs.tollPerAxle || 0).toFixed(2).replace('.',',')} = R$ {printOs.tollCost?.toFixed(2).replace('.',',')}</span></div>
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Outras Despesas:</span><span className="font-bold">R$ {(printOs.otherExpenses || 0).toFixed(2).replace('.',',')}</span></div>
                <div className="p-2 print:p-1 bg-gray-100">
                   <span className="text-gray-600 block">FRETE TOTAL DA OS:</span>
                   <span className="font-bold text-base print:text-sm print:text-xs">
                     {`R$ ${((printOs.grossValue || 0) + (printOs.tollCost || 0) + (printOs.otherExpenses || 0)).toFixed(2).replace('.',',')}`}
                   </span>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight text-center">
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Combustível (Estimado):</span><span className="font-bold text-red-600">- R$ {(printOs.fuelCost || 0).toFixed(2).replace('.',',')}</span></div>
                <div className="p-2 print:p-1">
                  {userRole === 'ADMIN' && (
                    <>
                      <span className="text-gray-600 block">Comissão Transportadora:</span>
                      <span className="font-bold text-rose-700">- R$ {(printOs.carrierCommission || 0).toFixed(2).replace('.',',')}</span>
                    </>
                  )}
                </div>
                <div className={`p-2 print:p-1 ${userRole === 'ADMIN' ? 'bg-emerald-50' : ''}`}>
                  {userRole === 'ADMIN' && (
                    <>
                      <span className="text-gray-600 block">LÍQUIDO DO MOTORISTA:</span>
                      <span className="font-bold text-base print:text-sm print:text-xs text-emerald-700">R$ {(printOs.netValue || 0).toFixed(2).replace('.',',')}</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">5. CLIENTE CONTRATOU O SERVIÇO</div>
          <div className="grid grid-cols-2 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Nome / Razão Social:</span><span className="font-bold">{printOs.clientName || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">CNPJ / CPF:</span><span className="font-bold">{printOs.clientDocument || '-'}</span></div>
          </div>
        </div>

        <div className="mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">6. INFORMAÇÕES COMPLEMENTARES</div>
          <div className="grid grid-cols-4 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Nota Fiscal:</span><span className="font-bold">{printOs.invoiceNumber || '-'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Data da Emissão:</span><span className="font-bold">{printOs.createdAt ? new Date(printOs.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Tipo de Serviço:</span><span className="font-bold">{printOs.serviceType || '-'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Forma de Pagamento:</span><span className="font-bold">{printOs.paymentMethod || '-'}</span></div>
          </div>
        </div>

        <div className="mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">7. STATUS DA OS</div>
          <div className="grid grid-cols-3 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight items-center">
            <div className="p-2 print:p-1 text-center"><span className="text-gray-600 block">Status da OS:</span><span className="font-bold text-base print:text-sm print:text-xs text-emerald-600 uppercase">{printOs.status === 'COMPLETED' ? 'Concluído' : printOs.status === 'IN_TRANSIT' ? 'Em Rota' : 'Pendente'}</span></div>
            <div className="p-2 print:p-1 text-center"><span className="text-gray-600 block">Data de Conclusão:</span><span className="font-bold">{printOs.completedAt ? new Date(printOs.completedAt).toLocaleDateString('pt-BR') : '-'}</span></div>
            <div className="p-2 print:p-1 text-center"><span className="text-gray-600 block">KM Percorrido:</span><span className="font-bold">-</span></div>
          </div>
        </div>

        <div className="mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">8. INFORMAÇÕES ADICIONAIS</div>
          <div className="p-2 text-xs print:text-[10px] leading-tight space-y-1 font-medium text-gray-700">
            <p>- O motorista deve portar esta OS durante todo o percurso.</p>
            <p>- Qualquer alteração deve ser comunicada imediatamente à empresa.</p>
            <p>- A execução do serviço implica na aceitação das condições aqui descritas.</p>
          </div>
        </div>

        <div className="text-center font-bold text-sm print:text-xs">
          <p>Agradecemos a preferência!</p>
          <p>EL Nathan Transportes</p>
        </div>

        {(printOs.photoNfLoading || printOs.photoNfDelivery || printOs.photoCargoDelivery) && (
          <div className="mt-4 print:mt-2 border border-blue-900 print:break-before-page">
            <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">ANEXOS (FOTOS)</div>
            <div className="grid grid-cols-3 gap-4 p-4">
              {printOs.photoNfLoading && (
                <div className="text-center">
                  <p className="text-xs print:text-[10px] leading-tight font-bold mb-2">NF Coleta</p>
                  <img onClick={() => setSelectedPhoto({ url: printOs.photoNfLoading!, title: 'NF Coleta' })} src={printOs.photoNfLoading} crossOrigin="anonymous" alt="NF Coleta" className="max-w-full h-auto border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity" style={{maxHeight: '200px', objectFit: 'contain'}} />
                </div>
              )}
              {printOs.photoNfDelivery && (
                <div className="text-center">
                  <p className="text-xs print:text-[10px] leading-tight font-bold mb-2">NF Assinada (Entrega)</p>
                  <img onClick={() => setSelectedPhoto({ url: printOs.photoNfDelivery!, title: 'NF Assinada (Entrega)' })} src={printOs.photoNfDelivery} crossOrigin="anonymous" alt="NF Assinada" className="max-w-full h-auto border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity" style={{maxHeight: '200px', objectFit: 'contain'}} />
                </div>
              )}
              {printOs.photoCargoDelivery && (
                <div className="text-center">
                  <p className="text-xs print:text-[10px] leading-tight font-bold mb-2">Carga Entregue</p>
                  <img onClick={() => setSelectedPhoto({ url: printOs.photoCargoDelivery!, title: 'Carga Entregue' })} src={printOs.photoCargoDelivery} crossOrigin="anonymous" alt="Carga Entregue" className="max-w-full h-auto border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity" style={{maxHeight: '200px', objectFit: 'contain'}} />
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
