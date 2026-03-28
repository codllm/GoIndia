import React from "react";
import { Phone, MessageCircle } from "lucide-react";

const Riding = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-200">

      {/* Full Screen Map */}
      <img
        src="https://res.cloudinary.com/dju008haw/image/upload/v1770575345/ChatGPT_Image_Feb_8_2026_11_58_25_PM_s3cmyk.png"
        alt="map"
        className="w-full h-full object-cover"
      />

      {/* Bottom Ride Card */}
      <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.15)] px-6 py-5">

        {/* Trip Status */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          On the way to destination
        </h3>

        {/* Driver Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="driver"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">Sarthak</p>
              <p className="text-xs text-gray-500">MP04 AB 1234</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="p-2 bg-gray-100 rounded-full">
              <Phone size={18} />
            </button>
            <button className="p-2 bg-gray-100 rounded-full">
              <MessageCircle size={18} />
            </button>
          </div>
        </div>

        {/* Route */}
        <div></div>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-start gap-2">
            <span>📍</span>
            <span>Kaikondrahalli, Bengaluru</span>
          </div>
          <div className="flex items-start gap-2">
            <span>🏁</span>
            <span>Third Wave Coffee, HSR</span>
          </div>
        </div>

        {/* End Ride */}
        <button className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition">
          End Ride
        </button>
      </div>
    </div>
  );
};

export default Riding;
