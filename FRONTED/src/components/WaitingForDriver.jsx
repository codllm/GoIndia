import React from "react";

const WaitingForDriver = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-200">

      {/* MAP */}
      <img
        src="https://res.cloudinary.com/dju008haw/image/upload/v1770575345/ChatGPT_Image_Feb_8_2026_11_58_25_PM_s3cmyk.png"
        alt="map"
        className="w-full h-full object-cover"
      />

      {/* DRIVER CAR ICON (Simulated movement) */}
      <div className="absolute top-1/3 left-1/4 animate-bounce">
        🚗
      </div>

      {/* ETA BUBBLE */}
      <div className="absolute top-10 left-6 bg-white px-4 py-2 rounded-full shadow-md">
        <span className="text-sm font-semibold">
          Driver arriving in 4 mins
        </span>
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.15)] px-6 py-5">

        {/* Driver Info */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="driver"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">Sarthak</p>
              <p className="text-xs text-gray-500">4.9 ⭐</p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-semibold text-gray-900">MP04 AB 1234</p>
            <p className="text-xs text-gray-500">Maruti Suzuki Alto</p>
          </div>
        </div>

        <div className="h-px bg-gray-200 mb-4" />

        {/* Trip Details */}
        <div className="space-y-3 text-sm mb-5">
          <div className="flex items-start gap-3">
            <span>📍</span>
            <span>Pickup Location</span>
          </div>
          <div className="flex items-start gap-3">
            <span>🏁</span>
            <span>Drop Location</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Trip Fare</span>
          <span className="font-semibold text-gray-900">₹193.20</span>
        </div>

      </div>
    </div>
  );
};

export default WaitingForDriver;
