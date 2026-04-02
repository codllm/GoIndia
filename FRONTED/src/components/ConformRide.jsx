import React, { useContext, useState } from "react";
import { ArrowLeft, MapPin, Navigation, Wallet, Info, Loader2 } from "lucide-react";
import { RidingContext } from "../context/ridingDataContext";
import axios from "axios";
import { motion } from "framer-motion";
import { UserDataContext } from "../context/userContext";

const ConfirmRide = ({ Setcurentpanel }) => {
  const { rideData, setRideData } = useContext(RidingContext);
  const { user } = useContext(UserDataContext);
  const [isBooking, setIsBooking] = useState(false);

  const getDisplayText = (item) => {
    if (!item) return "Address not found";
    return typeof item === "string" ? item : (item.name || item.display_name || "Unknown Location");
  };

  const createRide = async () => {
    const token = localStorage.getItem("userToken");
    setIsBooking(true);
    
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
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-2xl sm:rounded-3xl rounded-t-3xl border-t sm:border border-slate-700/50 max-h-[85vh] flex flex-col px-4 py-6 text-slate-100">
      
      {/* Header */}
      <header className="mb-6 px-2 flex items-center gap-4 flex-shrink-0">
        <button
          onClick={() => Setcurentpanel("vehicle")}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="text-white" size={24} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-white">Confirm Ride</h3>
          <p className="text-slate-400 text-sm mt-1">Review your booking details</p>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 space-y-6">
        
        {/* Vehicle Spotlight */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center bg-slate-800/30 rounded-3xl p-6 border border-slate-700/50 relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
          
          <img
            className="w-40 object-contain drop-shadow-2xl relative z-10"
            src={rideData.image || "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy82NDkzYzI1NS04N2M4LTRlMmUtOTQyOS1jZjcwOWJmMWI4MzgucG5n"}
            alt="Selected Vehicle"
          />
          <div className="text-center mt-4 relative z-10">
            <h4 className="text-xl font-bold text-white tracking-wide">{rideData.vehicleName || "UberGo"}</h4>
            <span className="inline-block mt-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-500/30">
              Best match for you
            </span>
          </div>
        </motion.div>

        {/* Route Details Card */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 shadow-sm relative">
          <div className="absolute left-[39px] top-[40px] bottom-[40px] w-0.5 bg-gradient-to-b from-blue-400 to-emerald-400 rounded-full"></div>

          <div className="flex items-start gap-4 mb-6 relative">
            <div className="z-10 bg-slate-900 p-2 rounded-full border border-slate-700 ring-2 ring-blue-500/20 mt-1">
              <MapPin size={16} className="text-blue-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Pickup Location</p>
              <p className="text-[15px] font-medium text-slate-100 mt-1 truncate">{getDisplayText(rideData.pickup)}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 relative">
            <div className="z-10 bg-slate-900 p-2 rounded-full border border-slate-700 ring-2 ring-emerald-500/20 mt-1">
              <Navigation size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Destination</p>
              <p className="text-[15px] font-medium text-slate-100 mt-1 truncate">{getDisplayText(rideData.destination)}</p>
            </div>
          </div>
        </div>

        {/* Pricing and Payment */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <Wallet size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Cash Payment</p>
                <p className="text-[11px] text-slate-400">Pay directly to driver</p>
              </div>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">₹{rideData.fare}</span>
          </div>
          
          <div className="h-[1px] bg-slate-700/50 w-full mb-3"></div>
          
          <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-tight">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span>Fare includes basic tolls and booking fees. Final price may change slightly based on traffic.</span>
          </div>
        </div>

      </div>

      {/* Sticky Bottom CTA */}
      <div className="pt-4 flex-shrink-0 border-t border-slate-800/50 mt-auto">
        <button
          disabled={isBooking}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 transition-all text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 text-lg tracking-wide flex items-center justify-center gap-2"
          onClick={createRide}
        >
          {isBooking ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Booking...
            </>
          ) : (
            `Confirm ${rideData.vehicleName || "Ride"}`
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;