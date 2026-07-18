
export interface Client {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  phone: string;
  password?: string;
}

export interface Driver {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  pixKeyType: string;
  pixKey: string;
  bank: string;
  agency: string;
  account: string;
  vehiclePlateHorse: string;
  vehiclePlateTrailer: string;
  vehicleType: string;
  axes: number;
  capacityWeight?: string;
  bodyType?: string;
  yearModel?: string;
  lat: number;
  lng: number;
  status: 'PARKED' | 'MOVING';
  password?: string;
  docCNH?: string;
  docRG?: string;
  docAddress?: string;
  // Compliance / Block Engine
  cnhExpiry?: string;
  rntrcExpiry?: string;
  operationalStatus?: 'ACTIVE' | 'BLOCKED_COMPLIANCE';
  // Financial Wallet
  currentBalance?: number;
  lockedBalance?: number;
}

export interface OrderService {
  id: string;
  number: string;
  driverId: string;
  clientId?: string;
  clientName?: string;
  clientDocument?: string;
  driverName?: string;
  driverCpf?: string;
  driverPhone?: string;
  driverPlate?: string;
  driverPix?: string;
  vehicleType?: string;
  capacityWeight?: string;
  bodyType?: string;
  yearModel?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED' | 'CANCELLED_CRITICAL';
  paymentStatusClient?: 'PENDING' | 'PAID';
  paymentStatusDriver?: 'PENDING' | 'PAID';
  origin: string;
  destinations: string[]; // Keep as is, using destinations[0] for end destination
  collectionDateTime?: string;
  deliveryDateTime?: string;
  cargoType: string;
  estimatedWeight?: string;
  cargoVolume?: string;
  kmL: number;
  dieselPrice: number;
  distanceKm: number;
  kmFinal?: number;
  observations?: string;
  tollCost: number;
  tollPerAxle?: number;
  axles?: number; // Total axles
  axlesLoaded?: number; // Paying axles
  otherExpenses?: number;
  fuelCost: number;
  freightMinimum: number;
  carrierCommission?: number;
  netValue: number;
  grossValue: number;
  totalValue?: number;
  advancePayment?: number; // Adiantamento
  invoiceNumber?: string;
  issueDate?: string;
  serviceType?: string;
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
  photoNfLoading?: string;
  photoNfDelivery?: string;
  photoCargoDelivery?: string;
}
