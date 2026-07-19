const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(
  `                        for (const os of selected) {
                          const { updateDoc, doc } = await import('firebase/firestore');
                          const { db } = await import('../firebase');
                          await updateDoc(doc(db, 'orders', os.id!), { paymentStatusDriver: 'PAID', driverPaymentStatus: 'Pago' });
                        }
                        import('sonner').then(({toast}) => toast.success('Pagamento confirmado!'));`,
  `                        try {
                          for (const os of selected) {
                            const { updateDoc, doc } = await import('firebase/firestore');
                            const { db } = await import('../firebase');
                            await updateDoc(doc(db, 'orders', os.id!), { paymentStatusDriver: 'PAID', driverPaymentStatus: 'Pago' });
                          }
                          import('sonner').then(({toast}) => toast.success('Pagamento confirmado!'));
                        } catch (error) {
                          console.error("Error updating payments:", error);
                          import('sonner').then(({toast}) => toast.error('Erro ao atualizar pagamentos.'));
                        }`
);

code = code.replace(
  `                        for (const os of selected) {
                          const { updateDoc, doc } = await import('firebase/firestore');
                          const { db } = await import('../firebase');
                          await updateDoc(doc(db, 'orders', os.id!), { paymentStatusClient: 'PAID', clientPaymentStatus: 'Pago' });
                        }
                        import('sonner').then(({toast}) => toast.success('Recebimento confirmado!'));`,
  `                        try {
                          for (const os of selected) {
                            const { updateDoc, doc } = await import('firebase/firestore');
                            const { db } = await import('../firebase');
                            await updateDoc(doc(db, 'orders', os.id!), { paymentStatusClient: 'PAID', clientPaymentStatus: 'Pago' });
                          }
                          import('sonner').then(({toast}) => toast.success('Recebimento confirmado!'));
                        } catch (error) {
                          console.error("Error updating receipts:", error);
                          import('sonner').then(({toast}) => toast.error('Erro ao atualizar recebimentos.'));
                        }`
);

fs.writeFileSync('src/components/Admin.tsx', code);
console.log("Fixed Admin.tsx try/catch");
