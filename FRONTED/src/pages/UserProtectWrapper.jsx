import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProtectWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    if (!token) {
      navigate('/user-login');
    }
    setChecking(false);
  }, [token, navigate]);

  if (checking) return <div>Loading...</div>;

  return children;
};

export default UserProtectWrapper;