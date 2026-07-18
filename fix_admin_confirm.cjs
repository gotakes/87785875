const fs = require('fs');

let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// 1. Add confirmModal state
const stateToFind = `  const [loadedClientOs, setLoadedClientOs] = useState<any>(null);`;
const stateToAdd = `  const [loadedClientOs, setLoadedClientOs] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);`;

content = content.replace(stateToFind, stateToAdd);

// 2. Replace confirm calls
const oldDeleteOs = `  const handleDeleteOs = async (osId: string) => {
    if (confirm('Tem certeza que deseja excluir esta Ordem de Serviço? Esta ação é irreversível e removerá a OS de todo o sistema.')) {
      try {
        await deleteDoc(doc(db, 'orders', osId));
        toast.success('OS excluída com sucesso.');
      } catch (error) {
        console.error("Error deleting OS:", error);
        toast.error('Erro ao excluir OS.');
      }
    }
  };`;
const newDeleteOs = `  const handleDeleteOs = async (osId: string) => {
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
  };`;
content = content.replace(oldDeleteOs, newDeleteOs);

const oldDeleteDriverDetail = `                                  if (confirm('Tem certeza que deseja excluir este motorista? Esta ação é irreversível.')) {
                                    try {
                                      await deleteDoc(doc(db, 'drivers', driver.id!));
                                      toast.success('Motorista excluído com sucesso.');
                                      onBack();
                                    } catch (err) {
                                      toast.error('Erro ao excluir motorista.');
                                    }
                                  }`;
const newDeleteDriverDetail = `                                  setConfirmModal({
                                    title: 'Excluir Motorista',
                                    message: 'Tem certeza que deseja excluir este motorista? Esta ação é irreversível.',
                                    onConfirm: async () => {
                                      try {
                                        await deleteDoc(doc(db, 'drivers', driver.id!));
                                        toast.success('Motorista excluído com sucesso.');
                                        onBack();
                                      } catch (err) {
                                        toast.error('Erro ao excluir motorista.');
                                      }
                                      setConfirmModal(null);
                                    }
                                  });`;
content = content.replace(oldDeleteDriverDetail, newDeleteDriverDetail);

const oldDeleteDriverList = `    if (confirm('Tem certeza que deseja excluir este motorista? Esta ação é irreversível.')) {
      try {
        await deleteDoc(doc(db, 'drivers', id));
        toast.success('Motorista excluído com sucesso.');
      } catch (error) {
        console.error("Error deleting driver:", error);
        toast.error('Erro ao excluir motorista.');
      }
    }`;
const newDeleteDriverList = `    setConfirmModal({
      title: 'Excluir Motorista',
      message: 'Tem certeza que deseja excluir este motorista? Esta ação é irreversível.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'drivers', id));
          toast.success('Motorista excluído com sucesso.');
        } catch (error) {
          console.error("Error deleting driver:", error);
          toast.error('Erro ao excluir motorista.');
        }
        setConfirmModal(null);
      }
    });`;
content = content.replace(oldDeleteDriverList, newDeleteDriverList);


const modalComponent = `
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
              <p className="text-slate-600">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
`;

content = content.replace("{/* Sidebar */}", modalComponent);

fs.writeFileSync('src/components/Admin.tsx', content);

