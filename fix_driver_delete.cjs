const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const bad = `  const handleDelete = async () => {
    setConfirmModal({
      title: 'Excluir Motorista',
      message: 'Tem certeza que deseja excluir este motorista? Esta ação é irreversível.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'drivers', driver.id));
          toast.success('Motorista excluído com sucesso.');
          onBack();
        } catch (error) {
          console.error("Error deleting driver: ", error);
          toast.error('Erro ao excluir motorista.');
        }
        setConfirmModal(null);
      }
    });
  };`;

const good = `  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este motorista? Esta ação é irreversível.')) {
        try {
          await deleteDoc(doc(db, 'drivers', driver.id));
          toast.success('Motorista excluído com sucesso.');
          onBack();
        } catch (error) {
          console.error("Error deleting driver: ", error);
          toast.error('Erro ao excluir motorista.');
        }
    }
  };`;

content = content.replace(bad, good);

fs.writeFileSync('src/components/Admin.tsx', content);
