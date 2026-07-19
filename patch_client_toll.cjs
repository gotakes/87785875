const fs = require('fs');
let content = fs.readFileSync('src/components/Client.tsx', 'utf8');

content = content.replace(
  `  const handleRouteCalculated = useCallback((data: { distance: number, time: number }) => {
    const calculatedDistance = data.distance; // in km
    const calculatedDuration = data.time; // in seconds
    
    const tollPerKmPerAxle = 0.15;
    const estimatedTollPerAxle = calculatedDistance * tollPerKmPerAxle;

    setBaseRoute({
      distance: calculatedDistance,
      duration: calculatedDuration,
      tollPerAxle: estimatedTollPerAxle
    });
    setRouteCalculated(true);
  }, []);`,
  `  const handleRouteCalculated = useCallback(async (data: { distance: number, time: number }) => {
    const calculatedDistance = data.distance; // in km
    const calculatedDuration = data.time; // in seconds
    
    setBaseRoute({
      distance: calculatedDistance,
      duration: calculatedDuration,
      tollPerAxle: 0 // Será calculado pelo useEffect ou mantido 0 enquanto carrega
    });
  }, []);`
);

const newEffect = `
  useEffect(() => {
    if (baseRoute.distance > 0 && !routeCalculated) {
      const fetchToll = async () => {
        try {
          const origins = mapOrigin.split(';');
          const dests = mapDest.split(';');
          const response = await fetch('/api/calculate-toll', {
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
          let totalToll = tollData.toll || 0;
          
          if (totalToll === 0) {
             // Fallback caso a API falhe ou falte a key
             totalToll = baseRoute.distance * 0.20 * (osFormState.axles || 2);
          }
          
          const tollPerAxle = (osFormState.axles || 2) > 0 ? totalToll / (osFormState.axles || 2) : totalToll;
          
          setBaseRoute(prev => ({ ...prev, tollPerAxle }));
        } catch (e) {
          console.error('Falha ao calcular pedágio com IA', e);
          const fallbackToll = baseRoute.distance * 0.20;
          setBaseRoute(prev => ({ ...prev, tollPerAxle: fallbackToll }));
        } finally {
          setRouteCalculated(true);
        }
      };
      
      fetchToll();
    }
  }, [baseRoute.distance, mapOrigin, mapDest, currentVehicleType, osFormState.axles, routeCalculated]);
`;

content = content.replace(
  `  useEffect(() => {
    if (baseRoute.distance === 0) return;`,
  newEffect + `\n  useEffect(() => {\n    if (baseRoute.distance === 0) return;`
);

fs.writeFileSync('src/components/Client.tsx', content);
