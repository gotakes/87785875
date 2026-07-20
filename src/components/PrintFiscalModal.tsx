import React, { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OrderService, Driver } from '../types';
import { toast } from 'sonner';

// html2pdf is loaded globally in index.html, but typescript doesn't know it unless declared

interface PrintFiscalModalProps {
  driver: Driver;
  orders: OrderService[]; // Should be only PAID or completed orders in the selected year
  year: string;
  onClose: () => void;
}

export default function PrintFiscalModal({ driver, orders, year, onClose }: PrintFiscalModalProps) {
  // 1. ESTRUTURA DE OBJETO JSON (ARQUITETURA DE DADOS)
  // O sistema estrutura os rendimentos neste formato antes de renderizar e exportar.
  const fiscalData = {
    fontePagadora: {
      razaoSocial: "EL NATHAN TRANSPORTES LTDA",
      cnpj: "00.000.000/0001-00", // Fictício
    },
    beneficiario: {
      nome: driver.name,
      cpfCnpj: driver.cpf || "Não informado",
      tipo: driver.pixKeyType === 'CNPJ' ? 'Pessoa Jurídica (MEI)' : 'Pessoa Física (Autônomo)',
    },
    resumo: {
      bruto: orders.reduce((sum, os) => sum + (os.grossValue || 0), 0),
      retencoes: orders.reduce((sum, os) => sum + ((os.grossValue || 0) - (os.netValue || 0)), 0),
      liquido: orders.reduce((sum, os) => sum + (os.netValue || 0), 0), 
      // OBS: Estamos usando o líquido (netValue). Se houver pedágios e despesas (otherExpenses), podemos adicionar.
      // Para fins fiscais, o bruto é o valor total do frete antes de adiantamentos/despesas de manutenção.
    },
    historico: orders.map(os => ({
      osId: os.number,
      dataPagamento: new Date(os.createdAt).toLocaleDateString('pt-BR'), // Regime de caixa (usando createdAt por aproximação)
      cliente: os.clientName || 'Cliente Padrão',
      bruto: os.grossValue || 0,
      descontos: (os.grossValue || 0) - (os.netValue || 0), 
      liquido: os.netValue || 0
    }))
  };

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

  const handleDownloadPdf = () => {
    openInNewWindowAndPrint('print-fiscal-content', `Comprovante_Rendimentos_${year}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] print:bg-white flex flex-col items-center py-10 print:py-0 print:block">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl print:rounded-none overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-100 border-b border-slate-200 p-2 md:p-4 flex justify-between items-center shadow-sm print:hidden z-10">
          <h3 className="font-bold text-slate-900">Extrato de Rendimentos - {year}</h3>
          <div className="flex gap-2">
            <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium transition-colors"
            >
              <Download size={18} /> Salvar
            </button>
            <button onClick={onClose} className="flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-700 w-10 h-10 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Document Content */}
        <div id="print-fiscal-content" className="p-10 print:p-0 bg-white text-slate-900 font-sans">
          
          <div className="text-center mb-3 md:mb-4 md:mb-8 border-b-2 border-slate-800 pb-4">
            <h1 className="text-xl md:text-xl md:text-2xl font-bold uppercase tracking-widest text-slate-900">Comprovante de Rendimentos</h1>
            <h2 className="text-base md:text-lg font-medium text-slate-600">Ano-Calendário {year}</h2>
            <p className="text-xs text-slate-500 mt-2">Documento válido para Declaração de IRPF / Carnê-Leão / DASN-SIMEI</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 md:gap-4 md:gap-8 mb-3 md:mb-4 md:mb-8 border border-slate-300 p-2 md:p-4 rounded bg-slate-50">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">1. Fonte Pagadora</p>
              <p className="font-bold text-slate-900">{fiscalData.fontePagadora.razaoSocial}</p>
              <p className="text-xs md:text-sm">CNPJ: {fiscalData.fontePagadora.cnpj}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">2. Beneficiário (Motorista)</p>
              <p className="font-bold text-slate-900">{fiscalData.beneficiario.nome}</p>
              <p className="text-xs md:text-sm">CPF/CNPJ: {fiscalData.beneficiario.cpfCnpj}</p>
              <p className="text-xs md:text-sm">Natureza: {fiscalData.beneficiario.tipo}</p>
            </div>
          </div>

          <div className="mb-3 md:mb-4 md:mb-8">
            <h3 className="text-sm md:text-base font-bold uppercase text-slate-900 border-b border-slate-300 pb-2 mb-3 md:mb-4">3. Resumo dos Rendimentos do Período</h3>
            <div className="flex justify-center text-center">
              <div className="border border-slate-200 p-2 md:p-6 rounded bg-indigo-50 border-indigo-100 min-w-[300px]">
                <p className="text-sm font-bold text-indigo-700 uppercase mb-2">Rendimento Líquido Pago</p>
                <p className="text-3xl font-black text-indigo-900">{formatBRL(fiscalData.resumo.liquido)}</p>
              </div>
            </div>
          </div>

          <div className="mb-3 md:mb-4">
            <h3 className="text-sm md:text-base font-bold uppercase text-slate-900 border-b border-slate-300 pb-2 mb-3 md:mb-4">4. Relação de Pagamentos Realizados</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-slate-700 uppercase">
                  <th className="py-2 px-2">Data (Caixa)</th>
                  <th className="py-2 px-2">Nº OS</th>
                  <th className="py-2 px-2">Cliente Tomador</th>
                  
                  <th className="py-2 px-2 text-right">Líquido Recebido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fiscalData.historico.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">Nenhum pagamento registrado neste período.</td>
                  </tr>
                ) : (
                  fiscalData.historico.map((item, idx) => (
                    <tr key={idx} className="avoid-break hover:bg-slate-50">
                      <td className="py-2 px-2">{item.dataPagamento}</td>
                      <td className="py-2 px-2 font-medium">#{item.osId}</td>
                      <td className="py-2 px-2 max-w-[150px]">{item.cliente}</td>
                      
                      <td className="py-2 px-2 text-right font-bold">{formatBRL(item.liquido)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-800 font-bold avoid-break">
                  <td colSpan={3} className="py-3 px-2 text-right uppercase text-slate-700">TOTAIS NO ANO:</td>
                  <td className="py-3 px-2 text-right text-indigo-900">{formatBRL(fiscalData.resumo.liquido)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-300 text-center">
            <p className="text-xs text-slate-500 mb-3 md:mb-4 md:mb-6">
              Declaramos que as informações acima são verdadeiras e refletem os repasses de fretes realizados no ano-calendário.
            </p>
            <div className="inline-block border-t border-blue-900 w-64 pt-2">
              <p className="text-sm md:text-base font-bold uppercase">EL NATHAN TRANSPORTES LTDA</p>
              <p className="text-xs">Responsável Financeiro</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
