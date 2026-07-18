import { toast } from "sonner";
import { Toaster } from "sonner";
import React, { useState, useEffect } from 'react';
import AdminPanel from './components/Admin';
import DriverPanel from './components/Driver';
import Login from './components/Login';
import ClientPanel from './components/Client';
import { Client } from './types';
import { defaultPricingTiers, defaultPricingExcess, PricingTier, PricingExcess } from './lib/pricing';
import { Driver, OrderService } from './types';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, query, where, getDocs } from 'firebase/firestore';

function App() {
  const [profile, setProfile] = useState<'SELECT' | 'ADMIN' | 'DRIVER' | 'CLIENT'>('SELECT');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<OrderService[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(defaultPricingTiers);
  const [pricingExcess, setPricingExcess] = useState<PricingExcess>(defaultPricingExcess);

  useEffect(() => {
    // Listen to drivers collection
    const driversQ = query(collection(db, 'drivers'));
    const unsubscribeDrivers = onSnapshot(driversQ, (snapshot) => {
      const driversData: Driver[] = [];
      snapshot.forEach((doc) => {
        driversData.push({ id: doc.id, ...doc.data() } as Driver);
      });
      setDrivers(driversData);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });

    // Listen to clients collection
    const clientsQ = query(collection(db, 'clients'));
    const unsubscribeClients = onSnapshot(clientsQ, (snapshot) => {
      const clientsData: Client[] = [];
      snapshot.forEach((doc) => {
        clientsData.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(clientsData);
    });
    
    // Listen to settings
    const settingsQ = query(collection(db, 'settings'));
    const unsubscribeSettings = onSnapshot(settingsQ, (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.id === 'pricing') {
          setPricingTiers(doc.data().tiers || defaultPricingTiers);
          setPricingExcess(doc.data().excess || defaultPricingExcess);
        }
      });
    });

    // Listen to orders collection
    const ordersQ = query(collection(db, 'orders'));
    const unsubscribeOrders = onSnapshot(ordersQ, (snapshot) => {
      const ordersData: OrderService[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as OrderService);
      });
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => {
      console.error("Firestore orders onSnapshot error:", error);
    });

    return () => {
      unsubscribeDrivers();
      unsubscribeOrders();
      unsubscribeClients();
      unsubscribeSettings();
    };
  }, []);

  const handleLogin = async (role: 'ADMIN' | 'DRIVER' | 'CLIENT', userId?: string, password?: string) => {
    if (role === 'DRIVER' && userId) {
      const q = query(collection(db, 'drivers'), where('phone', '==', userId), where('password', '==', password));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const driverDoc = querySnapshot.docs[0];
        setCurrentUserId(driverDoc.id);
        setProfile(role);
      } else {
        toast.error('Motorista não encontrado ou senha incorreta.');
      }
    } else if (role === 'CLIENT' && userId) {
      const q = query(collection(db, 'clients'), where('phone', '==', userId), where('password', '==', password));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setCurrentUserId(doc.id);
        setProfile(role);
      } else {
        toast.error('Cliente não encontrado ou senha incorreta.');
      }
    } else {
      setProfile(role);
    }
  };

  const handleLogout = () => {
    setProfile('SELECT');
    setCurrentUserId('');
  };

  const handleRegister = async (newDriver: Partial<Driver>) => {
    try {
      const driverRef = doc(collection(db, 'drivers'));
      const driver: Driver = {
        id: driverRef.id,
        name: newDriver.name || '',
        cpf: newDriver.cpf || '',
        phone: newDriver.phone || '',
        pixKeyType: '',
        pixKey: '',
        bank: '',
        agency: '',
        account: '',
        vehiclePlateHorse: newDriver.vehiclePlateHorse || '',
        vehiclePlateTrailer: '',
        vehicleType: newDriver.vehicleType || '',
        axes: 3,
        lat: -23.5505, 
        lng: -46.6333,
        status: 'PARKED',
        ...newDriver
      };
      
      await setDoc(driverRef, driver);
      toast.success(`Conta do motorista ${driver.name} criada e enviada para o administrador com sucesso!`);
      
      // Auto login after register
      setCurrentUserId(driverRef.id);
      setProfile('DRIVER');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Erro ao criar cadastro.");
    }
  };

      const handleResetPassword = async (role: 'ADMIN' | 'DRIVER' | 'CLIENT', phone: string, document: string, newPassword: string): Promise<boolean> => {
    if (role === 'ADMIN') {
      const savedAdminPhone = localStorage.getItem('adminPhone') || '11910211515';
      if (phone === savedAdminPhone) {
        localStorage.setItem('adminPwd', newPassword);
        return true;
      }
      return false;
    } else if (role === 'DRIVER') {
      const q = query(collection(db, 'drivers'), where('phone', '==', phone), where('cpf', '==', document));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, { password: newPassword }, { merge: true });
        return true;
      }
      return false;
    } else if (role === 'CLIENT') {
      const q = query(collection(db, 'clients'), where('phone', '==', phone), where('document', '==', document));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, { password: newPassword }, { merge: true });
        return true;
      }
      return false;
    }
    return false;
  };

  const handleRegisterClient = async (newClient: Partial<Client>) => {
    try {
      const clientRef = doc(collection(db, 'clients'));
      const client: Client = {
        id: clientRef.id,
        name: newClient.name || '',
        document: newClient.document || '',
        phone: newClient.phone || '',
        password: newClient.password || '',
      };
      
      await setDoc(clientRef, client);
      toast.success('Conta de cliente criada com sucesso!');
      
      setCurrentUserId(clientRef.id);
      setProfile('CLIENT');
    } catch (error) {
      console.error("Error adding client: ", error);
      toast.error("Erro ao criar cadastro de cliente.");
    }
  };

  if (profile === 'SELECT') {
    return <Login onLogin={handleLogin} onRegister={handleRegister} onRegisterClient={handleRegisterClient} onResetPassword={handleResetPassword} />;
  }

  if (profile === 'ADMIN') {
    return <AdminPanel drivers={drivers} orders={orders} clients={clients} onLogout={handleLogout} />;
  }

  if (profile === 'CLIENT') {
    const client = clients.find(c => c.id === currentUserId);
    if (!client) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-600 mb-4">Carregando dados do cliente...</p>
            <button onClick={handleLogout} className="text-indigo-600 font-semibold hover:underline">Voltar ao login</button>
          </div>
        </div>
      );
    }
    return <ClientPanel client={client} orders={orders} drivers={drivers} onLogout={handleLogout} pricingTiers={pricingTiers} pricingExcess={pricingExcess} />;
  }

  if (profile === 'DRIVER') {
    const driver = drivers.find(d => d.id === currentUserId);
    
    if (!driver) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-600 mb-4">Carregando dados do motorista...</p>
            <button onClick={handleLogout} className="text-indigo-600 font-semibold hover:underline">
              Voltar ao login
            </button>
          </div>
        </div>
      );
    }

    const driverOrders = orders.filter(o => o.driverId === driver.id);
    return <DriverPanel driver={driver} orders={driverOrders} onLogout={handleLogout} />;
  }

  return null;
}

export default App;
