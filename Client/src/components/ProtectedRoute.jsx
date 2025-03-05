import axios from "axios";
import { Navigate } from "react-router-dom";
import api from "../config/api";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const [isVerified, setIsVerified] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.post(
          `${api.Url}/user/verify-user`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.status) {
          setIsVerified(true);
          if (res.data.email === "omawchar07@gmail.com") {
            setIsAdmin(true);
          }
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
    return <div>Loading...</div>;
  }

  if (!isVerified || (adminOnly && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
