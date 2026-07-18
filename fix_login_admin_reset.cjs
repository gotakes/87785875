const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const target = `    if (role === 'ADMIN') {
      const savedAdminPhone = localStorage.getItem('adminPhone') || '11910211515';
      const savedAdminPwd = localStorage.getItem('adminPwd') || '4907';
      if (cleanPhone === savedAdminPhone && password === savedAdminPwd) {
        onLogin('ADMIN');
      } else {
        setError('Acesso negado. Credenciais de administrador inválidas.');
      }
    } else {`;

const replacement = `    if (role === 'ADMIN') {
      const savedAdminPhone = localStorage.getItem('adminPhone') || '11910211515';
      const savedAdminPwd = localStorage.getItem('adminPwd') || '4907';
      
      if (isResetting) {
        if (cleanPhone === savedAdminPhone) {
          if (onResetPassword) {
             const success = await onResetPassword('ADMIN', cleanPhone, '', password);
             if (success) {
               import('sonner').then(({toast}) => toast.success('Senha de administrador atualizada!'));
               setIsResetting(false);
               setPassword('');
             } else {
               setError('Não foi possível redefinir a senha.');
             }
          }
        } else {
          setError('Telefone de administrador incorreto.');
        }
        return;
      }
      
      if (cleanPhone === savedAdminPhone && password === savedAdminPwd) {
        onLogin('ADMIN');
      } else {
        setError('Acesso negado. Credenciais de administrador inválidas.');
      }
    } else {`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/Login.tsx', content);
