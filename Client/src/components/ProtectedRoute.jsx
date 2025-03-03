import axios from "axios";
import { Navigate } from "react-router-dom";
import api from "../config/api";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Get token from local storage
  const [isVerified, setIsVerified] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.post(
          `${api.Url}/user/verify-user`,
          {}, // Empty body (if required)
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token correctly
            },
          }
        );

        if (res.data.status) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (error) {
        setIsVerified(false);
      }
    };

    if (token) {
      verifyUser();
    } else {
      setIsVerified(false);
    }
  }, [token]);

  if (isVerified === null) {
    return <div>Loading...</div>; // Show loading while verifying
  }

  if (!isVerified) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
