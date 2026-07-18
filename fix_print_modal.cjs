const fs = require('fs');
let content = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');

// add useState import
content = content.replace("import React from 'react';", "import React, { useState } from 'react';");
content = content.replace("import { FileText, MessageCircle, Globe, Truck } from 'lucide-react';", "import { FileText, MessageCircle, Globe, Truck, ArrowLeft, Printer } from 'lucide-react';");

content = content.replace(/export default function PrintOsModal[^\{]+\{/, `$&
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string, title: string } | null>(null);
`);

// Add selected photo view
content = content.replace(/return \([\s\S]*?<div className="fixed inset-0 z-\[9999\] bg-white overflow-y-auto print:bg-white flex flex-col">/, `return (
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
              onClick={() => window.print()} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Printer size={18} /> Imprimir / Salvar PDF
            </button>
          </div>
          <div className="flex-1 p-8 flex items-center justify-center print:p-0 print:block">
            <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-w-full max-h-[85vh] object-contain print:max-h-none print:w-full print:h-auto" />
          </div>
        </div>
      )}
`);

// Hide the main content when a photo is selected
content = content.replace(/<div className="sticky top-0 z-\[100\] bg-slate-100 border-b border-slate-200 p-4 flex justify-between items-center shadow-sm print:hidden">/, `<div className={\`sticky top-0 z-[100] bg-slate-100 border-b border-slate-200 p-4 flex justify-between items-center shadow-sm print:hidden \${selectedPhoto ? 'hidden' : ''}\`}>`);

content = content.replace(/<div id="print-os-content" className="p-8 print:p-0 bg-white">/, `<div id="print-os-content" className={\`p-8 print:p-0 bg-white \${selectedPhoto ? 'hidden print:hidden' : ''}\`}>`);

// Add onClick to images
content = content.replace(/<img src={printOs.photoNfLoading} alt="NF Coleta" className="max-w-full h-auto border border-gray-300" style={{maxHeight: '200px', objectFit: 'contain'}} \/>/, `<img onClick={() => setSelectedPhoto({ url: printOs.photoNfLoading!, title: 'NF Coleta' })} src={printOs.photoNfLoading} alt="NF Coleta" className="max-w-full h-auto border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity" style={{maxHeight: '200px', objectFit: 'contain'}} />`);

content = content.replace(/<img src={printOs.photoNfDelivery} alt="NF Assinada" className="max-w-full h-auto border border-gray-300" style={{maxHeight: '200px', objectFit: 'contain'}} \/>/, `<img onClick={() => setSelectedPhoto({ url: printOs.photoNfDelivery!, title: 'NF Assinada (Entrega)' })} src={printOs.photoNfDelivery} alt="NF Assinada" className="max-w-full h-auto border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity" style={{maxHeight: '200px', objectFit: 'contain'}} />`);

content = content.replace(/<img src={printOs.photoCargoDelivery} alt="Carga Entregue" className="max-w-full h-auto border border-gray-300" style={{maxHeight: '200px', objectFit: 'contain'}} \/>/, `<img onClick={() => setSelectedPhoto({ url: printOs.photoCargoDelivery!, title: 'Carga Entregue' })} src={printOs.photoCargoDelivery} alt="Carga Entregue" className="max-w-full h-auto border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity" style={{maxHeight: '200px', objectFit: 'contain'}} />`);

fs.writeFileSync('src/components/PrintOsModal.tsx', content);
