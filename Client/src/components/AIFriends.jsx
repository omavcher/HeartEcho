import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import '../styles/AIFriends.css';
import { Link } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css"; // ✅ Import Skeleton styles
import api from "../config/api";

function AIFriends() {
  const [aiModels, setAiModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${api.Url}/user/get-pre-ai`)
      .then((response) => {
        
        setAiModels(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load AI models. Please try again.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="ai-friendsdd-section">
      {/* ✅ Show error message if any */}
      {error && <p className="error-message">{error}</p>}

      {/* ✅ AI Models Display */}
      <div className="ai-frendns-section3e">
        {loading
          ? // ✅ Show skeletons while loading
            Array.from({ length: 4 }).map((_, index) => (
              <div className="ai-frendns-box-edg" key={index}>
                <Skeleton height={100} width={100} circle={true} />
                <div className="ai-frendns-box-edg-content">
                  <Skeleton width={40} />
                  <Skeleton height={20} width="80%" />
                  <Skeleton count={2} width="90%" />
                </div>
              </div>
            ))
          : // ✅ Show actual AI models after loading
            aiModels.map((model) => (
              <Link
                to={`/chatbox?chatId=${model._id}`}
                className="ai-frendns-box-edg"
                key={model._id}
              >
                <img src={model.avatar_img} alt={model.name} />
                <div className="ai-frendns-box-edg-content">
                  <span>{model.age}</span>
                  <h3>{model.name}</h3>
                  <p>{model.description.split(" ").slice(0, 7).join(" ")}...</p>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}

export default AIFriends;
