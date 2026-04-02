import React from "react";
import axios from "axios";
import { RidingContext } from "../context/ridingDataContext";
import { User, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const VehiclePanel = ({ Setcurentpanel, currentpanel }) => {
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
    <div className="w-full bg-slate-900/95 backdrop-blur-2xl sm:rounded-3xl rounded-t-3xl border-t sm:border border-slate-700/50 max-h-[85vh] overflow-y-auto px-4 py-6 text-slate-100">
      
      <header className="mb-6 px-2 flex items-center gap-4">
        {currentpanel !== "location" && (
          <button 
            onClick={() => Setcurentpanel("location")}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
        )}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-white">Choose a ride</h3>
          <p className="text-slate-400 text-sm mt-1">Recommended for your route</p>
        </div>
      </header>

      <div className="space-y-3">
        {vehicles.map((v, index) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
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
            className="group flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 active:scale-[0.98] transition-all rounded-2xl cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="relative bg-white/5 rounded-xl p-2">
                <img
                  className="h-12 w-16 object-contain group-hover:scale-110 transition-transform duration-300"
                  src={v.image}
                  alt={v.name}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-slate-100">{v.name}</span>
                  <span className="flex items-center text-xs text-slate-300 bg-slate-700 px-2 py-0.5 rounded-full font-medium">
                    <User size={12} className="mr-1" /> {v.capacity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{v.desc}</p>
                <p className="text-xs text-emerald-400 mt-1 font-medium">{v.time}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xl font-bold text-white tracking-tight">
                {loading ? (
                  <div className="h-6 w-16 bg-slate-700 animate-pulse rounded"></div>
                ) : fares[v.type] ? (
                  `₹${fares[v.type]}`
                ) : (
                  "N/A"
                )}
              </span>
              <ChevronRight size={20} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-800">
        <p className="text-xs text-center text-slate-500 px-4">
          Fares are inclusive of taxes. Actual price may vary based on traffic and demand.
        </p>
      </div>
    </div>
  );
};

export default VehiclePanel;