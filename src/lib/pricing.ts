export interface PricingTier {
  id: string;
  minKm: number;
  maxKm: number;
  label: string;
  prices: {
    passeio: number;
    fiorino: number;
    van: number;
    vuc: number;
    medio: number;
    toco: number;
    truck: number;
  };
}

export interface PricingExcess {
  passeio: number;
  fiorino: number;
  van: number;
  vuc: number;
  medio: number;
  toco: number;
  truck: number;
}

export const defaultPricingTiers: PricingTier[] = [
  { id: '1', minKm: 0, maxKm: 25, label: '0000-0025 Km', prices: { passeio: 261.04, fiorino: 291.04, van: 329.22, vuc: 387.90, medio: 465.20, toco: 616.93, truck: 732.86 } },
  { id: '2', minKm: 26, maxKm: 50, label: '0026-0050 Km', prices: { passeio: 337.81, fiorino: 308.70, van: 337.81, vuc: 396.49, medio: 523.46, toco: 664.16, truck: 754.34 } },
  { id: '3', minKm: 51, maxKm: 75, label: '0051-0075 Km', prices: { passeio: 358.80, fiorino: 322.04, van: 358.80, vuc: 429.42, medio: 571.24, toco: 715.39, truck: 790.66 } },
  { id: '4', minKm: 76, maxKm: 100, label: '0076-0100 Km', prices: { passeio: 391.10, fiorino: 330.54, van: 391.10, vuc: 460.99, medio: 619.09, toco: 774.24, truck: 852.53 } },
  { id: '5', minKm: 101, maxKm: 150, label: '0101-0150 Km', prices: { passeio: 413.14, fiorino: 356.15, van: 413.14, vuc: 509.63, medio: 680.38, toco: 877.55, truck: 900.17 } },
  { id: '6', minKm: 151, maxKm: 200, label: '0151-0200 Km', prices: { passeio: 465.92, fiorino: 388.94, van: 465.92, vuc: 584.50, medio: 723.86, toco: 972.47, truck: 1010.00 } },
  { id: '7', minKm: 201, maxKm: 300, label: '0201-0300 Km', prices: { passeio: 560.82, fiorino: 436.74, van: 560.82, vuc: 687.24, medio: 852.41, toco: 1187.84, truck: 1305.38 } },
  { id: '8', minKm: 301, maxKm: 400, label: '0301-0400 Km', prices: { passeio: 695.60, fiorino: 503.05, van: 695.60, vuc: 800.05, medio: 1096.06, toco: 1611.22, truck: 1639.02 } },
  { id: '9', minKm: 401, maxKm: 500, label: '0401-0500 Km', prices: { passeio: 798.44, fiorino: 605.05, van: 798.44, vuc: 925.57, medio: 1209.07, toco: 1810.84, truck: 1892.05 } },
  { id: '10', minKm: 501, maxKm: 600, label: '0501-0600 Km', prices: { passeio: 941.57, fiorino: 675.10, van: 941.57, vuc: 1066.38, medio: 1394.35, toco: 2077.18, truck: 2190.94 } },
  { id: '11', minKm: 601, maxKm: 700, label: '0601-0700 Km', prices: { passeio: 1147.24, fiorino: 745.15, van: 1147.24, vuc: 1253.05, medio: 1567.12, toco: 2351.84, truck: 2500.94 } },
  { id: '12', minKm: 701, maxKm: 800, label: '0701-0800 Km', prices: { passeio: 1283.42, fiorino: 845.39, van: 1283.42, vuc: 1398.02, medio: 1765.57, toco: 2618.17, truck: 2816.51 } },
  { id: '13', minKm: 801, maxKm: 900, label: '0801-0900 Km', prices: { passeio: 1451.57, fiorino: 966.16, van: 1451.57, vuc: 1576.36, medio: 1977.98, toco: 2927.59, truck: 3152.92 } },
  { id: '14', minKm: 901, maxKm: 1000, label: '0901-1000 Km', prices: { passeio: 1613.84, fiorino: 1147.31, van: 1613.84, vuc: 1752.53, medio: 2198.77, toco: 3254.92, truck: 3505.54 } },
];

export const defaultPricingExcess: PricingExcess = {
  passeio: 1.61, fiorino: 1.46, van: 1.61, vuc: 1.75, medio: 2.20, toco: 3.25, truck: 3.50
};

export const calculateFreightValue = (
  distanceKm: number, 
  vehicleType: string,
  tiers: PricingTier[] = defaultPricingTiers,
  excess: PricingExcess = defaultPricingExcess
): number => {
  const type = vehicleType.toLowerCase();
  
  let typeKey: keyof PricingExcess | null = null;
  if (type.includes('passeio')) typeKey = 'passeio';
  else if (type.includes('fiorino')) typeKey = 'fiorino';
  else if (type.includes('van') || type.includes('hr')) typeKey = 'van';
  else if (type.includes('vuc')) typeKey = 'vuc';
  else if (type.includes('médio') || type.includes('medio')) typeKey = 'medio';
  else if (type.includes('toco')) typeKey = 'toco';
  else if (type.includes('truck')) typeKey = 'truck';
  else typeKey = 'passeio'; // fallback
  
  const roundedDistance = Math.round(distanceKm);
  const targetTier = tiers.find(t => roundedDistance >= t.minKm && roundedDistance <= t.maxKm);
  
  if (targetTier) {
    return targetTier.prices[typeKey];
  } else if (roundedDistance > 1000) {
    const maxTier = tiers[tiers.length - 1];
    const maxTierPriceCents = Math.round(maxTier.prices[typeKey] * 100);
    const excessKm = roundedDistance - 1000;
    const excessPriceCents = Math.round(excess[typeKey] * 100);
    const totalCents = maxTierPriceCents + (excessKm * excessPriceCents);
    return totalCents / 100;
  }
  
  return 0; // fallback
};
