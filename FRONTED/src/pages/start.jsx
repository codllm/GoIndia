import React from "react";
import { useNavigate } from "react-router-dom";

const Start = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Background Image */}
      <img
        src="https://res.cloudinary.com/dju008haw/image/upload/v1774470974/ChatGPT_Image_Mar_26_2026_02_05_22_AM_rfqzir.png"
        alt="Uber style background"
        className="w-full h-full object-cover"
      />

      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl px-6 py-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Get started with Uber
        </h2>

        <button
          className="w-full bg-black text-white py-4 rounded-lg
             flex items-center justify-center gap-2
             hover:bg-gray-900 transition"

             onClick={() => navigate('user-login')}

        >
          Continue
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
};

export default Start;
