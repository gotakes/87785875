const fs = require('fs');

let adminContent = fs.readFileSync('src/components/Admin.tsx', 'utf8');
adminContent = adminContent.replace(
  /{ paymentStatusDriver: 'PAID' }/g,
  "{ paymentStatusDriver: 'PAID', driverPaymentStatus: 'Pago' }"
);
adminContent = adminContent.replace(
  /{ paymentStatusClient: 'PAID' }/g,
  "{ paymentStatusClient: 'PAID', clientPaymentStatus: 'Pago' }"
);
fs.writeFileSync('src/components/Admin.tsx', adminContent);

let financeContent = fs.readFileSync('src/components/FinancePanel.tsx', 'utf8');
const oldHandleSave = `  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), editForm);
      toast.success('Informações financeiras atualizadas com sucesso!');
      setEditingId(null);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao atualizar dados financeiros.');
    }
  };`;

const newHandleSave = `  const handleSave = async (id: string) => {
    try {
      const payload = { ...editForm };
      
      if (activeTab === 'RECEIVABLE') {
        if (payload.clientPaymentStatus === 'Pago') {
          payload.paymentStatusClient = 'PAID';
        } else if (payload.clientPaymentStatus === 'Pendente') {
          payload.paymentStatusClient = 'PENDING';
        }
      } else {
        if (payload.driverPaymentStatus === 'Pago') {
          payload.paymentStatusDriver = 'PAID';
        } else if (payload.driverPaymentStatus === 'Pendente') {
          payload.paymentStatusDriver = 'PENDING';
        }
      }

      await updateDoc(doc(db, 'orders', id), payload);
      toast.success('Informações financeiras atualizadas com sucesso!');
      setEditingId(null);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao atualizar dados financeiros.');
    }
  };`;

financeContent = financeContent.replace(oldHandleSave, newHandleSave);
fs.writeFileSync('src/components/FinancePanel.tsx', financeContent);

console.log("Patched sync");
