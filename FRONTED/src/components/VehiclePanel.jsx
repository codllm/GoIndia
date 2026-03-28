import React from "react";
import axios from "axios";
import { RidingContext } from "../context/ridingDataContext";
import { User, ChevronRight } from "lucide-react"; // Install lucide-react
import { motion } from "framer-motion"; // Install framer-motion for smooth UI
import { ArrowLeft } from "lucide-react";

const VehiclePanel = ({ Setcurentpanel,currentpanel }) => {
  const { rideData, setRideData } = React.useContext(RidingContext);
  const [fares, setFares] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchFares = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
          {
            params: {
              pickup: rideData.pickup,
              destination: rideData.destination,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setFares(response.data.fare);
      } catch (err) {
        console.error("Fare fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (rideData.pickup && rideData.destination) {
      fetchFares();
    }
  }, [rideData.pickup, rideData.destination]);

  const vehicles = [
    {
      id: 1,
      name: "UberGo",
      type: "car",
      image: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy82NDkzYzI1NS04N2M4LTRlMmUtOTQyOS1jZjcwOWJmMWI4MzgucG5n",
      desc: "Affordable, compact rides",
      time: "2 mins away",
      capacity: 4,
    },
    {
      id: 2,
      name: "Moto",
      type: "motorcycle",
      image: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8yYzdmYTE5NC1jOTU0LTQ5YjItOWM2ZC1hM2I4NjAxMzcwZjUucG5n",
      desc: "Beat the traffic on a bike",
      time: "1 min away",
      capacity: 1,
    },
    {
      id: 3,
      name: "UberAuto",
      type: "auto",
      image: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8xZGRiOGM1Ni0wMjA0LTRjZTQtODFjZS01NmExMWEwN2ZlOTgucG5n",
      desc: "Bargain auto-rickshaw rides",
      time: "5 mins away",
      capacity: 3,
    },
  ];

  return (
    <div className="w-full bg-black min-h-[60vh] px-4 py-6 text-slate-100 rounded-t-3xl shadow-2xl">
      {/* Handle Bar for Mobile Feel */}
      <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6">
    
      </div>

      <header className="mb-6 px-2">
      {currentpanel !== "location" && (
                <ArrowLeft
                  className="float-end cursor-pointer"
                  onClick={() => Setcurentpanel("location")}
                />
              )}
        <h3 className="text-xl font-bold tracking-tight">Choose a ride</h3>
        <p className="text-slate-400 text-sm">Recommended for your route</p>
      </header>

      <div className="space-y-3">
        {vehicles.map((v, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={v.id}
            onClick={() => {
              setRideData((prev) => ({
                ...prev,
                vehicleType: v.type,
                vehicleName: v.name,
                fare: fares[v.type] || 0,
                image: v.image,
              }));
              Setcurentpanel("confirm");
            }}
            className="group flex items-center justify-between p-4 border border-slate-700/50 hover:border-blue-500/50 active:scale-[0.98] transition-all rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  className="h-14 w-20 object-contain group-hover:scale-110 transition-transform"
                  src={v.image}
                  alt={v.name}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{v.name}</span>
                  <span className="flex items-center text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                    <User size={12} className="mr-1" /> {v.capacity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">• {v.desc}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-lg font-bold text-white">
                {loading ? (
                  <div className="h-5 w-12 bg-slate-700 animate-pulse rounded"></div>
                ) : fares[v.type] ? (
                  `₹${fares[v.type]}`
                ) : (
                  "N/A"
                )}
              </span>
              <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="text-[10px] text-center text-slate-500 mt-6 px-4">
        Fares are inclusive of taxes. Actual price may vary based on traffic and demand.
      </p>
    </div>
  );
};

export default VehiclePanel;