// context/userContext.js

import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserDataContext = createContext(null);

const UserContextProvider = ({ children }) => {

  // 🔥 Restore from localStorage (like caption)
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("userToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const u = res.data.user;

  
        if (!u || !u._id) {
          console.log("❌ Invalid user data");
          setLoading(false);
          return;
        }

   
        const formattedUser = {
          _id: u._id,
          phone: u.phone,
          fullname: {
            firstname: u.firstname,
            lastname: u.lastname,
          },
        };

        setUserState(formattedUser);
        localStorage.setItem("userData", JSON.stringify(formattedUser));

      } catch (err) {
        console.log("❌ User fetch failed:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);


  const setUser = (data) => {
    if (!data || !data._id) {
      console.log("❌ Invalid user update blocked");
      return;
    }

    const formattedUser = {
      _id: data._id,
      phone: data.phone,
      fullname: {
        firstname: data.firstname || data.fullname?.firstname,
        lastname: data.lastname || data.fullname?.lastname,
      },
    };

    setUserState(formattedUser);
    localStorage.setItem("userData", JSON.stringify(formattedUser));
  };

  // 🔥 Logout
  const logoutUser = () => {
    setUserState(null);
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
  };

  return (
    <UserDataContext.Provider
      value={{
        user,
        setUser,
        loading,
        logoutUser,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContextProvider;