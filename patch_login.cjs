const fs = require('fs');
const file = 'src/components/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states for client documents and terms
if (!content.includes('docCnpj')) {
  content = content.replace(
    "const [docAddress, setDocAddress] = useState<File | null>(null);",
    `const [docAddress, setDocAddress] = useState<File | null>(null);
  const [docCnpj, setDocCnpj] = useState<File | null>(null);
  const [docClientAddress, setDocClientAddress] = useState<File | null>(null);
  const [docClientContract, setDocClientContract] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);`
  );
}

// 2. Validate acceptedTerms inside handleSubmit
const oldHandleSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\\D/g, '');
    
    if (isRegistering) {
      if (role === 'DRIVER') {`;
const newHandleSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\\D/g, '');
    
    if (isRegistering) {
      if (!acceptedTerms) {
        toast.error('Você deve aceitar os termos de uso para se cadastrar.');
        return;
      }
      if (role === 'CLIENT') {
        if (!docCnpj || !docClientAddress || !docClientContract) {
           toast.error('É obrigatório anexar os três documentos: CNPJ, Comprovante de Endereço e Contrato Social/Procuração.');
           return;
        }
      }
      if (role === 'DRIVER') {`;
content = content.replace(oldHandleSubmit, newHandleSubmit);

// 3. Add Documentação for Client inside the form (before Phone)
const clientDocs = `                {role === 'CLIENT' && (
                  <div className="pt-2 pb-2 border-y border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-3">Documentação Obrigatória (Fotos/PDF)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <label className={\`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group \${docCnpj ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}\`}>
                        <Upload size={18} className={\`\${docCnpj ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1\`} />
                        <span className="text-xs font-medium text-slate-500 text-center w-full px-1 truncate leading-tight">{docCnpj ? docCnpj.name : 'Cartão CNPJ'}</span>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setDocCnpj(e.target.files?.[0] || null)} />
                      </label>
                      <label className={\`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group \${docClientAddress ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}\`}>
                        <Upload size={18} className={\`\${docClientAddress ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1\`} />
                        <span className="text-xs font-medium text-slate-500 text-center w-full px-1 truncate leading-tight">{docClientAddress ? docClientAddress.name : 'Comp. Endereço'}</span>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setDocClientAddress(e.target.files?.[0] || null)} />
                      </label>
                      <label className={\`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group \${docClientContract ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}\`}>
                        <Upload size={18} className={\`\${docClientContract ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1\`} />
                        <span className="text-xs font-medium text-slate-500 text-center w-full px-1 truncate leading-tight">{docClientContract ? docClientContract.name : 'Contrato/Proc.'}</span>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setDocClientContract(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                )}
`;

content = content.replace("              </>\n            )}\n\n            <div>\n              <label className=\"block text-sm font-medium text-slate-700 mb-1.5\">\n                Número de Celular", "              </>\n            )}\n" + clientDocs + "\n            <div>\n              <label className=\"block text-sm font-medium text-slate-700 mb-1.5\">\n                Número de Celular");

// 4. Add Terms Checkbox for both Driver and Client before submit button
const termsCheckbox = `            {isRegistering && (
              <div className="flex items-start gap-3 mt-4 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <input 
                  type="checkbox" 
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                  Declaro que li, compreendo e aceito integralmente os <button type="button" onClick={() => setShowTermsModal(true)} className="text-indigo-600 font-bold hover:underline">Termos e Condições Jurídicas</button> {role === 'CLIENT' ? 'de prestação de serviços' : 'de autonomia, ausência de vínculo empregatício e rastreamento'}.
                </label>
              </div>
            )}
`;

content = content.replace('            <button\n              type="submit"', termsCheckbox + '            <button\n              type="submit"');

// 5. Add Terms Modal at the end of the file
const termsModal = `
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {role === 'CLIENT' ? 'Termos de Serviço - Portal do Cliente' : 'Termo de Autonomia e Rastreamento - Motorista'}
              </h2>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-500 hover:bg-slate-200 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700 space-y-4">
              {role === 'CLIENT' ? (
                <>
                  <p className="font-bold text-base text-slate-900 text-center uppercase border-b pb-2 mb-4">
                    Contrato de Prestação de Serviços de Transporte e Termos de Uso
                  </p>
                  <p><strong>1. DO OBJETO:</strong> O presente termo regula a utilização do sistema para cotação, emissão e gerenciamento de Ordens de Serviço (OS) de transportes, intermediadas pela plataforma.</p>
                  <p><strong>2. RESPONSABILIDADE FINANCEIRA:</strong> A CONTRATANTE (Cliente) declara assumir total responsabilidade pelo pagamento pontual dos valores acordados em cada Ordem de Serviço, seja em regime de faturamento ou pagamento à vista.</p>
                  <p><strong>3. VERACIDADE DOCUMENTAL:</strong> O signatário declara, sob as penas da lei (incluindo o crime de falsidade ideológica), que os documentos anexados (Cartão CNPJ, Comprovante de Endereço e Contrato Social/Procuração) são autênticos e que possui amplos poderes para representar a pessoa jurídica cadastrada.</p>
                  <p><strong>4. SIGILO E LGPD:</strong> A plataforma compromete-se a tratar os dados da CONTRATANTE conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), utilizando-os estritamente para a prestação dos serviços logísticos, faturamento e emissão de Notas Fiscais (NFS-e).</p>
                  <p><strong>5. ASSINATURA ELETRÔNICA:</strong> Nos termos da Medida Provisória nº 2.200-2/2001 e legislação vigente, o clique no botão "Aceito" no cadastro possui validade jurídica equivalente à assinatura de próprio punho, sendo o IP, timestamp e dados de conexão registrados em log de auditoria permanente no banco de dados.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-base text-slate-900 text-center uppercase border-b pb-2 mb-4">
                    Termo de Autonomia, Inexistência de Vínculo e Consentimento de Rastreamento
                  </p>
                  <p><strong>1. DA NATUREZA DA PRESTAÇÃO DO SERVIÇO:</strong> O CONTRATADO (Motorista Parceiro) declara expressamente que atuará na qualidade de Profissional Autônomo ou Microempreendedor Individual (MEI), não existindo qualquer vínculo empregatício com a plataforma, nos moldes dos artigos 2º e 3º da CLT, possuindo total liberdade de horários e autonomia para aceitar ou recusar Ordens de Serviço (OS).</p>
                  <p><strong>2. RESPONSABILIDADE CIVIL:</strong> O CONTRATADO assume responsabilidade civil sobre as mercadorias sob sua custódia durante as viagens, comprometendo-se a respeitar as leis de trânsito e conduzir a carga com zelo até o destino final acordado.</p>
                  <p><strong>3. RASTREAMENTO (LGPD):</strong> O CONTRATADO autoriza expressa e inequivocamente, para fins logísticos, de segurança da carga e comprovação de entrega (art. 7º, incisos II e V da LGPD), o <strong>rastreamento de sua localização (GPS) em tempo real</strong> pelo aplicativo durante a execução da OS. Os dados de localização não serão coletados após a finalização da viagem.</p>
                  <p><strong>4. DOCUMENTAÇÃO:</strong> O CONTRATADO declara que a CNH e os documentos do veículo anexados são regulares e autênticos. A irregularidade documental acarreta o bloqueio imediato do acesso à plataforma.</p>
                  <p><strong>5. ASSINATURA ELETRÔNICA:</strong> A validação deste termo via caixa de seleção ("checkbox") e envio dos dados de registro constitui assinatura eletrônica com validade jurídica (MP nº 2.200-2/2001), sendo armazenados o Endereço IP, Carimbo de Tempo (Timestamp) e Identificador do Dispositivo (Log de Auditoria).</p>
                </>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Eu li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("    </div>\n  );\n}\n", "    </div>\n" + termsModal + "  );\n}\n");

fs.writeFileSync(file, content);
console.log('Login patched with Legal Docs & Terms.');
