import React, { useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Userlogout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/user-login');
      return;
    }

    const logoutUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/logout`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          localStorage.removeItem('token');
          navigate('/user-login');
        }
      } catch (error) {
        console.error('Logout failed:', error);
        localStorage.removeItem('token');
        navigate('/user-login');
      }
    };

    logoutUser();
  }, []);

  return <div>Logging out...</div>;
};

export default Userlogout;
