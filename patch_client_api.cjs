const fs = require('fs');

const content = fs.readFileSync('src/components/Client.tsx', 'utf8');

const oldFetch = `          const response = await fetch('/api/calculate-toll', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               origins,
               destinations: dests,
               vehicleType: currentVehicleType || 'PASSEIO',
               axles: osFormState.axles || 2
             })
          });
          const tollData = await response.json();
          let totalToll = tollData.toll || 0;`;

const newFetch = `          let totalToll = 0; // Calculado localmente`;

const patched = content.replace(oldFetch, newFetch);
if (patched !== content) {
    fs.writeFileSync('src/components/Client.tsx', patched);
    console.log("Patched Client.tsx toll calculation");
} else {
    console.log("Could not find calculate-toll in Client.tsx");
}

