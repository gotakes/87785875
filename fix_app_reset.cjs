const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Find the onRegister handler and insert handleResetPassword right after it
const registerFind = `  const handleRegisterClient = async (newClient: {name: string, document: string, phone: string, password?: string}) => {`;

const handleResetPasswordCode = `  const handleResetPassword = async (role: 'ADMIN' | 'DRIVER' | 'CLIENT', phone: string, document: string, newPassword: string): Promise<boolean> => {
    if (role === 'ADMIN') {
      const savedAdminPhone = localStorage.getItem('adminPhone') || '11910211515';
      if (phone === savedAdminPhone) {
        localStorage.setItem('adminPwd', newPassword);
        return true;
      }
      return false;
    } else if (role === 'DRIVER') {
      const q = query(collection(db, 'drivers'), where('phone', '==', phone), where('cpf', '==', document));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, { password: newPassword }, { merge: true });
        return true;
      }
      return false;
    } else if (role === 'CLIENT') {
      const q = query(collection(db, 'clients'), where('phone', '==', phone), where('document', '==', document));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, { password: newPassword }, { merge: true });
        return true;
      }
      return false;
    }
    return false;
  };

`;

content = content.replace(registerFind, handleResetPasswordCode + registerFind);

// 2. Pass handleResetPassword to <Login />
const loginFind = `<Login onLogin={handleLogin} onRegister={handleRegister} onRegisterClient={handleRegisterClient} />`;
const loginReplace = `<Login onLogin={handleLogin} onRegister={handleRegister} onRegisterClient={handleRegisterClient} onResetPassword={handleResetPassword} />`;
content = content.replace(loginFind, loginReplace);

fs.writeFileSync('src/App.tsx', content);

