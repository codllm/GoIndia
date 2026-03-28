import React, { createContext, useState } from "react";

export const RidingContext = createContext();

export const RidingDataProvider = ({ children }) => {
  const [rideData, setRideData] = useState({
    pickup: null,
    destination: null,
    vehicleType: null,
    fare: null,
    distance: null,
    duration: null,
    driver: null,
    vehicleName: null,
    user: null,
    caption: null,
    image: null,
  });

  return (
    <RidingContext.Provider value={{ rideData, setRideData }}>
      {children}
    </RidingContext.Provider>
  );
};
