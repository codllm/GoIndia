import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const captionProtectWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("captionToken");

    if (!token) {
      navigate("/caption-login");
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return children;
};

export default captionProtectWrapper;