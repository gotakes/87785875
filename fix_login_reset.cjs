const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

// 1. Update handleSubmit to handle isResetting
const handleSubmitFind = `      if (isRegistering) {`;
const handleSubmitReplace = `      if (isResetting) {
        if (!resetDocument) {
          setError('O CPF/CNPJ é obrigatório para redefinir a senha.');
          return;
        }
        if (onResetPassword) {
          const success = await onResetPassword(role, cleanPhone, resetDocument, password);
          if (success) {
            toast.success('Senha atualizada com sucesso!');
            setIsResetting(false);
            setPassword('');
          } else {
            setError('Usuário não encontrado. Verifique seu número e documento.');
          }
        }
        return;
      }

      if (isRegistering) {`;

content = content.replace(handleSubmitFind, handleSubmitReplace);
content = content.replace(`const handleSubmit = (e: React.FormEvent) => {`, `const handleSubmit = async (e: React.FormEvent) => {`);

// 2. Add isResetting UI in the role selector
const roleTabsFind = `        {/* Role Selector Tabs */}
        {!isRegistering && (`;
const roleTabsReplace = `        {/* Role Selector Tabs */}
        {!isRegistering && !isResetting && (`;
content = content.replace(roleTabsFind, roleTabsReplace);

// 3. Add reset fields
const phoneInputFind = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número de Celular (WhatsApp)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>`;

const phoneInputReplace = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número de Celular (WhatsApp)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            
            {isResetting && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
            )}`;
content = content.replace(phoneInputFind, phoneInputReplace);

// 4. Change password label to new password
const pwdLabelFind = `              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha de Acesso
              </label>`;
const pwdLabelReplace = `              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isResetting ? 'Nova Senha' : 'Senha de Acesso'}
              </label>`;
content = content.replace(pwdLabelFind, pwdLabelReplace);

// 5. Change submit button text
const submitBtnFind = `              {isRegistering ? (
                <>Criar Conta Segura <UserPlus size={18} /></>
              ) : (
                <>Entrar no Sistema <ArrowRight size={18} /></>
              )}`;
const submitBtnReplace = `              {isResetting ? (
                <>Redefinir Senha <ShieldCheck size={18} /></>
              ) : isRegistering ? (
                <>Criar Conta Segura <UserPlus size={18} /></>
              ) : (
                <>Entrar no Sistema <ArrowRight size={18} /></>
              )}`;
content = content.replace(submitBtnFind, submitBtnReplace);

// 6. Add "Forgot Password?" link
const registerLinkFind = `            {(role === 'DRIVER' || role === 'CLIENT') && (
              <div className="text-center mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  {isRegistering ? 'Já tem uma conta?' : 'Primeiro acesso?'}
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(!isRegistering); setError(''); setPassword(''); }}
                    className="ml-1 font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    {isRegistering ? 'Fazer login' : 'Criar cadastro'}
                  </button>
                </p>
              </div>
            )}`;
const registerLinkReplace = `            {(role === 'DRIVER' || role === 'CLIENT') && (
              <div className="text-center mt-4 pt-4 border-t border-slate-100 space-y-3">
                <p className="text-sm text-slate-500">
                  {isRegistering || isResetting ? 'Já tem uma conta e sabe a senha?' : 'Primeiro acesso?'}
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(isRegistering || isResetting ? false : true); setIsResetting(false); setError(''); setPassword(''); }}
                    className="ml-1 font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    {isRegistering || isResetting ? 'Fazer login' : 'Criar cadastro'}
                  </button>
                </p>
                {!isRegistering && !isResetting && (
                  <button
                    type="button"
                    onClick={() => { setIsResetting(true); setError(''); setPassword(''); }}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                )}
              </div>
            )}`;
content = content.replace(registerLinkFind, registerLinkReplace);

fs.writeFileSync('src/components/Login.tsx', content);
