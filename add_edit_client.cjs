const fs = require('fs');

const content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const editClientModalCode = `function EditClientModal({ client, onClose }: { client: any, onClose: () => void }) {
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Editar Cliente</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Razão Social</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Documento (CPF/CNPJ)</label>
              <input type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha (Opcional)</label>
              <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditOsModal`;

const newContent = content.replace('function EditOsModal', editClientModalCode);

fs.writeFileSync('src/components/Admin.tsx', newContent);
