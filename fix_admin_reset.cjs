const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const findLink = `{(role === 'DRIVER' || role === 'CLIENT') && (
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

const replaceLink = `              <div className="text-center mt-4 pt-4 border-t border-slate-100 space-y-3">
                {(role === 'DRIVER' || role === 'CLIENT') && (
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
                )}
                
                {role === 'ADMIN' && (isRegistering || isResetting) && (
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(false); setIsResetting(false); setError(''); setPassword(''); }}
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Fazer login
                  </button>
                )}

                {!isRegistering && !isResetting && (
                  <button
                    type="button"
                    onClick={() => { setIsResetting(true); setError(''); setPassword(''); }}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                )}
              </div>`;

content = content.replace(findLink, replaceLink);
fs.writeFileSync('src/components/Login.tsx', content);
