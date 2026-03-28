import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapBg = ({ onLocationChange, currentpanel }) => {

  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {

    if (mapRef.current) return;

    // WHITE / CLEAN STYLE
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12", 
      center: [85.3096, 23.3441],
      zoom: 16,
    });

    mapRef.current.addControl(
      new mapboxgl.NavigationControl(),
      "bottom-right"
    );

    // CURRENT LOCATION
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        mapRef.current.setCenter(coords);
      },
      (err) => console.log(err)
    );

    //  MOVE END (like Google)
    mapRef.current.on("moveend", () => {

      const center = mapRef.current.getCenter();

      if (onLocationChange) {
        onLocationChange({
          lat: center.lat,
          lng: center.lng,
        });
      }

    });

  }, []);

  return (
    <div className="relative w-full h-full">

      {/* MAP */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 🔥 CENTER PIN UI */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-50 text-center">

        {currentpanel === "location" && (
          <div className="flex flex-col items-center">

            {/* label */}
            <div className="bg-white text-black px-3 py-1 text-xs font-semibold rounded-lg shadow-md mb-2 border">
              Pickup
            </div>

            {/* pin */}
            <div className="relative">

              <img
                src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                alt="pin"
                className="w-10 h-10 drop-shadow-md"
              />

              {/* pulse */}
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default MapBg;