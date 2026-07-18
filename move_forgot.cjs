const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const forgotLinkHtml = `
                {!isRegistering && !isResetting && (
                  <button
                    type="button"
                    onClick={() => { setIsResetting(true); setError(''); setPassword(''); }}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                )}`;

// Remove it from the bottom
content = content.replace(forgotLinkHtml, '');

// Add it to the password field area
const passwordFieldFind = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha {isRegistering ? 'Nova' : ''}
              </label>`;
const passwordFieldReplace = `            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  {isResetting ? 'Nova Senha' : \`Senha \${isRegistering ? 'Nova' : ''}\`}
                </label>
                {!isRegistering && !isResetting && (
                  <button
                    type="button"
                    onClick={() => { setIsResetting(true); setError(''); setPassword(''); }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>`;

content = content.replace(passwordFieldFind, passwordFieldReplace);

fs.writeFileSync('src/components/Login.tsx', content);
