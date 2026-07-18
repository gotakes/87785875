const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const target = `            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">`;

const replacement = `            {isResetting && role !== 'ADMIN' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  CPF/CNPJ (Confirmação)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={resetDocument}
                    onChange={(e) => setResetDocument(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder="Digite apenas números"
                  />
                </div>
              </div>
            )}
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">`;

content = content.replace(target, replacement);

// Hide scrollbar on login screen wrapper
const scrollTarget = `<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-x-hidden overflow-y-auto py-12">`;
const scrollReplacement = `<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-x-hidden overflow-y-auto py-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">`;
content = content.replace(scrollTarget, scrollReplacement);

fs.writeFileSync('src/components/Login.tsx', content);
