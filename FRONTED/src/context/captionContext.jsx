import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const captionDataContext = createContext(null);

const CaptionContextProvider = ({ children }) => {


  const [caption, setcaption] = useState(() => {
    const saved = localStorage.getItem("captionData");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

 

  useEffect(() => {
    const fetchcaptionProfile = async () => {
      const token = localStorage.getItem("captionToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/captions/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      

        const newCaption = res.data.caption;

     
        if (!newCaption || !newCaption._id) {
          console.log(" invalid caption ignored");
          return;
        }


        setcaption(newCaption);
        localStorage.setItem("captionData", JSON.stringify(newCaption));

      } catch (err) {
        console.log(" Profile fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchcaptionProfile();
  }, []);



  const updateCaption = (data) => {
    if (!data || !data._id) {
      console.log(" invalid caption update blocked");
      return;
    }

    setcaption(data);
    localStorage.setItem("captionData", JSON.stringify(data));
  };



  const logoutCaption = () => {
    setcaption(null);
    localStorage.removeItem("captionToken");
    localStorage.removeItem("captionData");
  };



  useEffect(() => {
    
  }, [caption]);



  return (
    <captionDataContext.Provider
      value={{
        caption,
        setcaption: updateCaption, 
        loading,
        logoutCaption,
      }}
    >
      {children}
    </captionDataContext.Provider>
  );
};

export default CaptionContextProvider;