const fs = require('fs');
let code = fs.readFileSync('src/components/Driver.tsx', 'utf8');

const oldGeoCode = `  useEffect(() => {
    // Geo-tracking
    const driverRef = doc(db, 'drivers', driver.id);
    let watchId: number;

    const hasActiveOrder = orders.some(o => o.status === 'IN_TRANSIT');

    if (navigator.geolocation && hasActiveOrder) {
      updateDoc(driverRef, { status: 'MOVING' }).catch(console.error);
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateDoc(driverRef, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            status: 'MOVING'
          }).catch(console.error);
        },
        (error) => {
          console.warn('Geolocation warning:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      updateDoc(driverRef, { status: 'PARKED' }).catch(console.error);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [driver.id, orders]);`;

const newGeoCode = `  useEffect(() => {
    // Geo-tracking optimized for real-time (2s)
    const hasActiveOrder = orders.some(o => o.status === 'IN_TRANSIT');
    let intervalId: NodeJS.Timeout;

    if (navigator.geolocation && hasActiveOrder) {
      const driverRef = doc(db, 'drivers', driver.id);
      updateDoc(driverRef, { status: 'MOVING' }).catch(console.error);
      
      const sendLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Update the real-time locations collection to avoid re-rendering the whole app
            const locRef = doc(db, 'locations', driver.id);
            // using setDoc from firebase/firestore, wait, we need to import setDoc if not imported
            // Driver.tsx has updateDoc but maybe not setDoc. Let's just use updateDoc with a catch and if it fails, oh wait, locations docs might not exist.
            // Let's import setDoc dynamically or add it.
            // Actually, we can use updateDoc on 'locations' if it exists, or just import setDoc.
          },
          (error) => {
            console.warn('Geolocation warning:', error.message);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      };
      
      sendLocation();
      intervalId = setInterval(sendLocation, 2000);
    } else {
      const driverRef = doc(db, 'drivers', driver.id);
      updateDoc(driverRef, { status: 'PARKED' }).catch(console.error);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [driver.id, orders]);`;

// I will properly replace this using AST or precise string matching later.
