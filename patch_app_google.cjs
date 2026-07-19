const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('APIProvider')) {
  content = `import { APIProvider } from '@vis.gl/react-google-maps';\n` + content;
  content = content.replace(
    'export default App;',
    `export default function WrappedApp() {
  const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  if (!hasValidKey) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'sans-serif', backgroundColor: '#f8fafc'}}>
        <div style={{textAlign:'center',maxWidth:520, background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>Google Maps API Key Necessária</h2>
          <p style={{marginBottom: '1rem'}}>Para localizar endereços em todo o Brasil (incluindo números e ruas específicas), o sistema agora utiliza o Google Maps.</p>
          <p><strong>Passo 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" style={{color: '#4f46e5'}}>Obter uma API Key</a></p>
          <p style={{marginTop: '1rem'}}><strong>Passo 2:</strong> Adicione a chave no AI Studio:</p>
          <ul style={{textAlign:'left',lineHeight:'1.8', background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem'}}>
            <li>Abra as <strong>Configurações</strong> (ícone ⚙️ no canto superior direito)</li>
            <li>Selecione <strong>Segredos (Secrets)</strong></li>
            <li>Digite <code>GOOGLE_MAPS_PLATFORM_KEY</code> como nome, pressione <strong>Enter</strong></li>
            <li>Cole sua API key, pressione <strong>Enter</strong></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly" language="pt-BR">
      <App />
    </APIProvider>
  );
}
`
  );
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched App.tsx with APIProvider");
}
