import React , {useContext} from "react";
import { ArrowLeft, MapPin, Navigation, Wallet, Info } from "lucide-react";
import { RidingContext } from "../context/ridingDataContext";
import axios from "axios";
import { motion } from "framer-motion";
import { UserDataContext } from "../context/userContext";

const ConfirmRide = ({ Setcurentpanel }) => {
  const { rideData, setRideData } = React.useContext(RidingContext);
  const { user } = useContext(UserDataContext);


  const getDisplayText = (item) => {
    if (!item) return "Address not found";
    return typeof item === "string" ? item : (item.name || item.display_name || "Unknown Location");
  };

  const createRide = async () => {


    const token = localStorage.getItem("userToken");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`,
        {
          pickup: rideData.pickup,
          destination: rideData.destination,
          vehicleType: rideData.vehicleType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        localStorage.setItem("currentRide", response.data._id);
        setRideData(response.data);
        Setcurentpanel("lookingForDriver");
      }
    } catch (err) {
      console.error("Error creating ride:", err);
    }
  };

  return (
    <div className="w-full bg-black rounded-t-[32px] px-6 pt-2 pb-8 text-slate-100 shadow-2xl border-t border-slate-800">
      {/* Handle Bar */}
      <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto my-4 opacity-50"></div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => Setcurentpanel("vehicle")}
          className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="text-xl font-bold">Confirm Summary</h3>
      </header>

      {/* Vehicle Spotlight */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center mb-10"
      >
        <img
          className="w-48 object-contain drop-shadow-[0_10px_15px_rgba(59,130,246,0.3)]"
          src={rideData.image || "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy82NDkzYzI1NS04N2M4LTRlMmUtOTQyOS1jZjcwOWJmMWI4MzgucG5n"}
          alt="Selected Vehicle"
        />
        <div className="text-center mt-2">
          <h4 className="text-lg font-bold text-white uppercase tracking-wider">{rideData.vehicleName || "UberGo"}</h4>
          <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase">Best match for you</p>
        </div>
      </motion.div>

      {/* Route Timeline */}
      <div className="relative space-y-8 mb-10 px-2">
        {/* Vertical Line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 to-slate-700"></div>

        <div className="flex items-start gap-5 relative">
          <div className="z-10 bg-blue-500 p-1.5 rounded-full ring-4 ring-blue-500/20">
            <MapPin size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Pickup Location</p>
            <p className="text-[15px] font-medium leading-tight mt-0.5 truncate w-64">{getDisplayText(rideData.pickup)}</p>
          </div>
        </div>

        <div className="flex items-start gap-5 relative">
          <div className="z-10 bg-slate-700 p-1.5 rounded-full ring-4 ring-slate-700/20">
            <Navigation size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Destination</p>
            <p className="text-[15px] font-medium leading-tight mt-0.5 truncate w-64">{getDisplayText(rideData.destination)}</p>
          </div>
        </div>
      </div>

      {/* Pricing and Payment */}
      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Wallet size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">Payment</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Cash on delivery</p>
            </div>
          </div>
          <span className="text-2xl font-black text-white">₹{rideData.fare}</span>
        </div>
        <div className="h-[1px] bg-slate-700/50 w-full mb-3"></div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Info size={14} />
          <span>Fare includes basic tolls and booking fees.</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.97] transition-all text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/40 text-lg tracking-wide"
        onClick={createRide}
      >
        Book {rideData.vehicleName || "Ride"}
      </button>
    </div>
  );
};

export default ConfirmRide;