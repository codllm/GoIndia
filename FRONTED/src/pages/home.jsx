import React, { useState, useCallback, useEffect, useContext } from "react";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConformRide";
import LookingForDriver from "../components/LokingForDriver";
import { ArrowLeft, MapPin, Navigation, Search } from "lucide-react";
import axios from "axios";
import debounce from "lodash.debounce";
import { RidingContext } from "../context/ridingDataContext";
import MapBg from "../components/mapBg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { setRideData } = useContext(RidingContext);

  const [currentpanel, Setcurentpanel] = useState("location");

  const [pickupInput, setPickupInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  // u come online send your location to backend n update
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        fetchAddress(coords);
      },
      (err) => {}
    );
  }, []);

  // GET SUGGESTIONS
  const getsuggestion = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: { input },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuggestions(response.data || []);
    } catch (error) {}
  };

  const debouncedSuggestion = useCallback(
    debounce((value) => {
      getsuggestion(value);
    }, 500),
    []
  );

  useEffect(() => {
    const isrideAvai = localStorage.getItem("currentRide");
    if (isrideAvai) {
      Setcurentpanel("lookingForDriver");
    }
  }, []);

  useEffect(() => {
    return () => {
      debouncedSuggestion.cancel();
    };
  }, [debouncedSuggestion]);

  /* SET RIDE DATA */
  useEffect(() => {
    if (pickup && destination) {
      const pickupName = typeof pickup === "string" ? pickup : pickup?.name;
      const destinationName =
        typeof destination === "string" ? destination : destination?.name;

      setRideData((prev) => ({
        ...prev,
        pickup: pickupName,
        destination: destinationName,
        pickupCoords: pickup?.location || null,
        destinationCoords: destination?.location || null,
      }));

      Setcurentpanel("vehicle");
      setSuggestions([]);
    }
  }, [pickup, destination]);

  /* REVERSE GEOCODING */
  const fetchAddress = async (coords) => {
    try {
      const token = localStorage.getItem("userToken");
      setPickupInput("Finding location...");

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-address`,
        {
          params: { lat: coords.lat, lng: coords.lng },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const address = response.data.address || response.data;
      const addressName = address?.name || address;

      setPickupInput(addressName);

      setPickup({
        name: addressName,
        location: coords,
      });
    } catch (err) {}
  };

  const debouncedReverseGeocode = useCallback(
    debounce((coords) => {
      fetchAddress(coords);
    }, 700),
    []
  );

  useEffect(() => {
    return () => {
      debouncedReverseGeocode.cancel();
    };
  }, [debouncedReverseGeocode]);

  const handleMapMove = (coords) => {
    if (activeField === "pickup" || activeField === null) {
      debouncedReverseGeocode(coords);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f172a] text-white font-sans">
      {/* LOGO */}
      <div className="absolute top-6 left-6 z-40">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-bold shadow-xl border border-white/20 text-slate-900 tracking-wide">
          GoIndia
        </div>
      </div>

      {/* PROFILE */}
      <div className="absolute top-6 right-6 z-40">
        <button
          onClick={() => navigate("/user-profile")}
          className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=$%7Buser.firstname%7D"
            alt="profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      {/* MAP */}
      <div className="absolute inset-0 z-0">
        <MapBg onLocationChange={handleMapMove} currentpanel={currentpanel} />
      </div>

      {/* FLOATING UI PANEL (Replaces Bottom Sheet) */}
      {currentpanel === "location" && (
        <div className="absolute z-30 bottom-0 sm:bottom-auto sm:top-24 sm:left-6 w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-2xl sm:rounded-3xl rounded-t-3xl border-t sm:border border-slate-700/50 shadow-2xl flex flex-col max-h-[85vh] transition-all duration-300">
          <div className="p-6 flex-shrink-0">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Search className="text-blue-400" size={24} /> Where to?
            </h2>

            <div className="relative flex gap-4">
              {/* Visual Route Connectors */}
              <div className="flex flex-col items-center mt-4">
                <div className="w-3 h-3 rounded-full border-2 border-blue-400 bg-slate-900 z-10"></div>
                <div className="w-[2px] flex-1 border-l-2 border-dashed border-slate-600 my-1"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-400 z-10"></div>
              </div>

              {/* Inputs */}
              <div className="flex-1 space-y-4">
                <div className="relative">
                  <input
                    value={pickupInput}
                    onFocus={() => setActiveField("pickup")}
                    onChange={(e) => {
                      setPickupInput(e.target.value);
                      debouncedSuggestion(e.target.value);
                    }}
                    placeholder="Current Location"
                    className="w-full bg-slate-800 text-white placeholder-slate-400 p-4 pl-12 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <Navigation
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                </div>

                <div className="relative">
                  <input
                    value={destinationInput}
                    onFocus={() => setActiveField("destination")}
                    onChange={(e) => {
                      setDestinationInput(e.target.value);
                      debouncedSuggestion(e.target.value);
                    }}
                    placeholder="Search destination..."
                    className="w-full bg-slate-800 text-white placeholder-slate-400 p-4 pl-12 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Suggestions (Scrollable area) */}
          <div className="overflow-y-auto flex-1 custom-scrollbar px-6 pb-4">
            <LocationSearchPanel
              suggestions={suggestions}
              activeField={activeField}
              setPickup={setPickup}
              setDestination={setDestination}
              setPickupInput={setPickupInput}
              setDestinationInput={setDestinationInput}
            />
          </div>
        </div>
      )}

      {/* VEHICLE PANEL */}
      {currentpanel === "vehicle" && (
        <div className="absolute z-30 bottom-0 sm:bottom-auto sm:top-24 sm:left-6 w-full sm:w-[420px] shadow-2xl">
          <VehiclePanel Setcurentpanel={Setcurentpanel} currentpanel={currentpanel} />
        </div>
      )}

      {/* CONFIRM RIDE PANEL */}
      {currentpanel === "confirm" && (
        <div className="absolute z-30 bottom-0 sm:bottom-auto sm:top-24 sm:left-6 w-full sm:w-[420px] shadow-2xl">
          <ConfirmRide Setcurentpanel={Setcurentpanel} />
        </div>
      )}

      {/* LOOKING FOR DRIVER PANEL */}
      {currentpanel === "lookingForDriver" && (
        <div className="absolute z-30 bottom-0 sm:bottom-auto sm:top-24 sm:left-6 w-full sm:w-[420px] shadow-2xl">
          <LookingForDriver />
        </div>
      )}
    </div>
  );
};

export default Home;