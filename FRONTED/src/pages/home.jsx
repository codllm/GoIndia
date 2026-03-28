import React, { useState, useCallback, useEffect, useContext } from "react";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConformRide";
import LookingForDriver from "../components/LokingForDriver";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import debounce from "lodash.debounce";
import { RidingContext } from "../context/ridingDataContext";
import MapBg from "../components/mapBg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [sheetPos, setSheetPos] = useState("down");
  const [startY, setStartY] = useState(0);

  const navigate = useNavigate();

  const { setRideData } = useContext(RidingContext);

  const [currentpanel, Setcurentpanel] = useState("location");

  const [pickupInput, setPickupInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  const positions = {
    down: "-65%",
    mid: "-35%",
    up: "-5%",
  };

  const openSheet = () => setSheetPos("up");

  const handleTouchStart = (e) => setStartY(e.touches[0].clientY);

  const handleTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;

    if (diff > 50) setSheetPos("up");
    else if (diff < -50) setSheetPos("down");
  };

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
      (err) => {
       
      }
    );
  }, []);

  //GET SUGGESTIONS

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
    } catch (error) {

    }
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

  /*SET RIDE DATA*/

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

  /*REVERSE GEOCODING*/

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
    } catch (err) {
     
    }
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
      <div className="absolute top-6 left-6 z-20">
        <div className=" backdrop-blur-md p-3 rounded-2xl font-bold shadow-xl border border-white/5 text-black">
          GoIndia
        </div>
      </div>

      {/* profile */}
      <div className="absolute top-4 right-4 z-50">
  <button
    onClick={() => navigate('/user-profile')}
    className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-200 flex items-center justify-center"
  >
    <img
      src="https://api.dicebear.com/7.x/avataaars/svg?seed=$%7Buser.firstname%7D" // or user.profileImage
      alt="profile"
      className="w-full h-full object-cover"
    />
  </button>
</div>

      {/* MAP */}
      <div className="w-full h-full">
        <MapBg onLocationChange={handleMapMove} currentpanel={currentpanel} />
      </div>

      {/* BOTTOM SHEET */}
      {currentpanel !== "confirm" && currentpanel !== "lookingForDriver" && (
        <div
          style={{ bottom: positions[sheetPos] }}
          className="absolute left-0 w-full h-[90%] bg-black backdrop-blur-2xl rounded-t-[40px] transition-all duration-500 z-30"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-600 rounded-full opacity-40"></div>
          </div>

          <div className="px-6 py-4">
            <h2 className="text-2xl font-bold mb-8">
              Where to?
            </h2>

            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center mt-6">
                <div className="w-3 h-3 rounded-full border-2 border-blue-400"></div>
                <div className="w-[2px] h-14 border-l-2 border-dashed border-gray-600 my-1"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>

              <div className="flex-1 space-y-3 ">
                <input
                  value={pickupInput}
                  onFocus={() => {
                    openSheet();
                    setActiveField("pickup");
                  }}
                  onChange={(e) => {
                    setPickupInput(e.target.value);
                    debouncedSuggestion(e.target.value);
                  }}
                  placeholder="Current Location"
                  className="w-full bg-white p-4 rounded-xl  text-black"
                />

                <input
                  value={destinationInput}
                  onFocus={() => {
                    openSheet();
                    setActiveField("destination");
                  }}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    debouncedSuggestion(e.target.value);
                  }}
                  placeholder="Enter destination"
                  className="w-full bg-white p-4 rounded-xl text-black border-black"
                />
              </div>
            </div>
          </div>

          {currentpanel === "location" && (
            <LocationSearchPanel
              suggestions={suggestions}
              activeField={activeField}
              setPickup={setPickup}
              setDestination={setDestination}
              setPickupInput={setPickupInput}
              setDestinationInput={setDestinationInput}
            />
          )}
        </div>
      )}

      {currentpanel === "vehicle" && (
        <div className="absolute inset-x-0 bottom-0 z-[60]">
          <VehiclePanel Setcurentpanel={Setcurentpanel} currentpanel={currentpanel} />
        </div>
      )}

      {currentpanel === "confirm" && (
        <div className="absolute inset-x-0 bottom-0 z-[60]">
          <ConfirmRide Setcurentpanel={Setcurentpanel} />
        </div>
      )}

      {currentpanel === "lookingForDriver" && (
        <div className="absolute inset-x-0 bottom-0 z-[60]">
          <LookingForDriver />
        </div>
      )}
    </div>
  );
};

export default Home;
