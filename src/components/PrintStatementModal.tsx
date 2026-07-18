import React from 'react';
import { OrderService } from '../types';
import { toast } from 'sonner';
import { FileText, MessageCircle, Truck, X, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PrintStatementModalProps {
  orders: OrderService[];
  role: 'CLIENT' | 'DRIVER' | 'ADMIN_TO_CLIENT' | 'ADMIN_TO_DRIVER';
  targetName: string;
  targetDocument: string;
  driverBankDetails?: {
    bank: string;
    agency: string;
    account: string;
    pix: string;
  };
  onClose: () => void;
  onWhatsApp?: () => void;
}

export const TRANSPORTER_BANK_DETAILS = {
  bank: 'Banco Itaú (341)',
  agency: '1234',
  account: '12345-6',
  accountType: 'Conta Corrente',
  pix: '12.345.678/0001-99',
  favored: 'El Nathan Transportes LTDA',
  cnpj: '12.345.678/0001-99'
};

export default function PrintStatementModal({ orders, role, targetName, targetDocument, driverBankDetails, onClose, onWhatsApp }: PrintStatementModalProps) {
  const isClientSide = role === 'CLIENT' || role === 'ADMIN_TO_CLIENT';
  
  const calculateTotal = () => {
    if (isClientSide) {
      return orders.reduce((acc, os) => acc + (os.totalValue || 0), 0);
    } else {
      return orders.reduce((acc, os) => acc + (os.netValue || 0), 0);
    }
  };

  const total = calculateTotal();
  const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
    openInNewWindowAndPrint('print-statement-content', `Extrato_${targetName}`);
    if (openWhatsApp && onWhatsApp) {
      onWhatsApp();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] print:bg-white flex flex-col items-center py-10 print:py-0 print:block">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl print:rounded-none overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-slate-100 border-b border-slate-200 p-4 flex justify-between items-center shadow-sm print:hidden z-10">
          <h3 className="font-bold text-slate-900">Visualização de Relatório ({orders.length} OSs)</h3>
          <div className="flex gap-2">
            {onWhatsApp && (
              <button onClick={() => handleDownloadPdf(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <MessageCircle size={18} /> WhatsApp (PDF)
              </button>
            )}
            <button 
               onClick={() => handleDownloadPdf()} 
               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FileText size={18} /> Salvar
            </button>
            <button onClick={onClose} className="flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-700 w-10 h-10 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div id="print-statement-content" className="p-10 print:p-0 bg-white">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-blue-900 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="El Nathan Transportes" className="h-28 w-auto object-contain" />
            </div>
            <div className="text-right text-blue-900">
              <h2 className="text-xl font-bold uppercase tracking-wider">
                {isClientSide ? 'Faturamento de Serviços' : 'Extrato de Repasse'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Data: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {isClientSide ? 'Faturado Para:' : 'Motorista Favorecido:'}
              </p>
              <h3 className="text-lg font-bold text-slate-900">{targetName}</h3>
              <p className="text-sm text-slate-700">{isClientSide ? 'CNPJ/CPF:' : 'CPF:'} {targetDocument}</p>
            </div>
            
            {/* Bank Details */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 min-w-[280px]">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dados Bancários para Pagamento</p>
              {isClientSide ? (
                <div className="text-sm text-slate-800 space-y-1">
                  <p><strong>Favorecido:</strong> {TRANSPORTER_BANK_DETAILS.favored}</p>
                  <p><strong>CNPJ:</strong> {TRANSPORTER_BANK_DETAILS.cnpj}</p>
                  <p><strong>Banco:</strong> {TRANSPORTER_BANK_DETAILS.bank}</p>
                  <p><strong>Agência:</strong> {TRANSPORTER_BANK_DETAILS.agency} | <strong>Conta:</strong> {TRANSPORTER_BANK_DETAILS.account}</p>
                  <p><strong>PIX:</strong> {TRANSPORTER_BANK_DETAILS.pix}</p>
                </div>
              ) : (
                <div className="text-sm text-slate-800 space-y-1">
                  <p><strong>Banco:</strong> {driverBankDetails?.bank || 'Não informado'}</p>
                  <p><strong>Agência:</strong> {driverBankDetails?.agency || '-'} | <strong>Conta:</strong> {driverBankDetails?.account || '-'}</p>
                  <p><strong>PIX:</strong> {driverBankDetails?.pix || 'Não informado'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left text-sm mb-8 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y-2 border-blue-900 text-slate-800 uppercase tracking-wider text-xs">
                <th className="py-3 px-2">OS</th>
                <th className="py-3 px-2">Data</th>
                <th className="py-3 px-2">Rota</th>
                {isClientSide && <th className="py-3 px-2">Veículo/Motorista</th>}
                <th className="py-3 px-2 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(os => {
                const val = isClientSide ? os.totalValue : os.netValue;
                return (
                  <tr key={os.id}>
                    <td className="py-3 px-2 font-bold">#{os.number}</td>
                    <td className="py-3 px-2">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-2 truncate max-w-[200px]">{os.origin.split(',')[0]} → {os.destinations?.[0]?.split(',')[0]}</td>
                    {isClientSide && <td className="py-3 px-2">{os.vehicleType || 'Não informado'} ({os.driverPlate || '-'})</td>}
                    <td className="py-3 px-2 text-right font-semibold">{formatBRL(val || 0)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-blue-900 avoid-break">
                <td colSpan={isClientSide ? 4 : 3} className="py-4 px-2 text-right font-bold text-slate-700 uppercase">
                  Total Geral:
                </td>
                <td className="py-4 px-2 text-right font-black text-xl text-slate-900">
                  {formatBRL(total)}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <div className="mt-12 text-center text-sm text-slate-500 border-t pt-4">
            Relatório gerado pelo sistema El Nathan Transportes.
          </div>
        </div>
      </div>
    </div>
  );
}
