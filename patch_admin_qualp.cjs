const fs = require('fs');

const content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const oldCode = `      const imagesBase64 = await Promise.all(base64Promises);
      
      const res = await fetch('/api/extract-qualp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagesBase64 })
      });
      
      const data = await res.json();
      if (res.ok) {
        if (data.origem) setRouteOrigins([data.origem]);
        if (data.destino) setRouteDests([data.destino]);
        if (data.distancia) (form.elements.namedItem('distance') as HTMLInputElement).value = data.distancia;
        if (data.pedagio) {
           const tollEl = form.elements.namedItem('tollPerAxle') as HTMLInputElement;
           if (tollEl) tollEl.value = data.pedagio;
        }
        
        setOsFormState(prev => ({
          ...prev,
          distance: parseFloat(data.distancia) || prev.distance,
          tollPerAxle: parseFloat(data.pedagio) || prev.tollPerAxle
        }));
        
        toast('Dados extraídos com sucesso pela IA!');
      } else {
        toast(\`Erro na IA: \${data.error || 'Desconhecido'}\`);
      }`;

const newCode = `      const imagesBase64 = await Promise.all(base64Promises);
      
      // Netlify static version - no backend support for AI extract
      toast('Recurso de IA desativado na versão estática. Preencha manualmente.');`;

const patched = content.replace(oldCode, newCode);
if (patched !== content) {
    fs.writeFileSync('src/components/Admin.tsx', patched);
    console.log("Patched Admin.tsx qualp");
} else {
    console.log("Could not find qualp logic in Admin.tsx");
}
