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
  { id: '1', minKm: 0, maxKm: 25, label: '0000-0025 Km', prices: { passeio: 260, fiorino: 270, van: 330, vuc: 390, medio: 470, toco: 620, truck: 730 } },
  { id: '2', minKm: 26, maxKm: 50, label: '0026-0050 Km', prices: { passeio: 340, fiorino: 350, van: 340, vuc: 400, medio: 520, toco: 660, truck: 750 } },
  { id: '3', minKm: 51, maxKm: 75, label: '0051-0075 Km', prices: { passeio: 360, fiorino: 370, van: 360, vuc: 430, medio: 570, toco: 720, truck: 790 } },
  { id: '4', minKm: 76, maxKm: 100, label: '0076-0100 Km', prices: { passeio: 390, fiorino: 400, van: 390, vuc: 460, medio: 620, toco: 770, truck: 850 } },
  { id: '5', minKm: 101, maxKm: 150, label: '0101-0150 Km', prices: { passeio: 410, fiorino: 420, van: 410, vuc: 510, medio: 680, toco: 880, truck: 900 } },
  { id: '6', minKm: 151, maxKm: 200, label: '0151-0200 Km', prices: { passeio: 470, fiorino: 480, van: 470, vuc: 580, medio: 720, toco: 970, truck: 1010 } },
  { id: '7', minKm: 201, maxKm: 300, label: '0201-0300 Km', prices: { passeio: 560, fiorino: 570, van: 560, vuc: 690, medio: 850, toco: 1190, truck: 1310 } },
  { id: '8', minKm: 301, maxKm: 400, label: '0301-0400 Km', prices: { passeio: 700, fiorino: 710, van: 700, vuc: 800, medio: 1100, toco: 1610, truck: 1640 } },
  { id: '9', minKm: 401, maxKm: 500, label: '0401-0500 Km', prices: { passeio: 800, fiorino: 810, van: 800, vuc: 930, medio: 1210, toco: 1810, truck: 1890 } },
  { id: '10', minKm: 501, maxKm: 600, label: '0501-0600 Km', prices: { passeio: 940, fiorino: 950, van: 940, vuc: 1070, medio: 1390, toco: 2080, truck: 2190 } },
  { id: '11', minKm: 601, maxKm: 700, label: '0601-0700 Km', prices: { passeio: 1150, fiorino: 1160, van: 1150, vuc: 1250, medio: 1570, toco: 2350, truck: 2500 } },
  { id: '12', minKm: 701, maxKm: 800, label: '0701-0800 Km', prices: { passeio: 1280, fiorino: 1290, van: 1280, vuc: 1400, medio: 1770, toco: 2620, truck: 2820 } },
  { id: '13', minKm: 801, maxKm: 900, label: '0801-0900 Km', prices: { passeio: 1450, fiorino: 1460, van: 1450, vuc: 1580, medio: 1980, toco: 2930, truck: 3150 } },
  { id: '14', minKm: 901, maxKm: 1000, label: '0901-1000 Km', prices: { passeio: 1610, fiorino: 1620, van: 1610, vuc: 1750, medio: 2200, toco: 3250, truck: 3510 } },
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
