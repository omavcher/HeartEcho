import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // ✅ Import Skeleton styles
import "../styles/HomeAiModels.css";
import api from "../config/api";

function HomeAiModels() {
  const [activeTab, setActiveTab] = useState("girls");
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

  // ✅ Filter & Limit AI Models (Max 10 per category)
  const getRandomModels = (models, count) => {
    return models
      .sort(() => Math.random() - 0.5) // ✅ Shuffle the array randomly
      .slice(0, count); // ✅ Pick the first `count` items
  };
  
  const filteredModels = getRandomModels(
    aiModels.filter((model) =>
      activeTab === "girls" ? model.gender === "female" : model.gender === "male"
    ),
    10
  );
  

  return (
    <div className="ai-models-section">
     <div className="ai-models-section-title">
        <h4>Our AI Catalog</h4>

        {/* ✅ Tab Selector */}
        <div className="ai-models-top-section-box4" data-active={activeTab}>
          <span
            className={activeTab === "girls" ? "active" : ""}
            onClick={() => setActiveTab("girls")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M11 15.9339C7.33064 15.445 4.5 12.3031 4.5 8.5C4.5 4.35786 7.85786 1 12 1C16.1421 1 19.5 4.35786 19.5 8.5C19.5 12.3031 16.6694 15.445 13 15.9339V18H18V20H13V24H11V20H6V18H11V15.9339ZM12 14C15.0376 14 17.5 11.5376 17.5 8.5C17.5 5.46243 15.0376 3 12 3C8.96243 3 6.5 5.46243 6.5 8.5C6.5 11.5376 8.96243 14 12 14Z"></path>
            </svg>
            Girl's
          </span>
          <span
            className={activeTab === "boys" ? "active" : ""}
            onClick={() => setActiveTab("boys")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M15.0491 8.53666L18.5858 5H14V3H22V11H20V6.41421L16.4633 9.95088C17.4274 11.2127 18 12.7895 18 14.5C18 18.6421 14.6421 22 10.5 22C6.35786 22 3 18.6421 3 14.5C3 10.3579 6.35786 7 10.5 7C12.2105 7 13.7873 7.57264 15.0491 8.53666ZM10.5 20C13.5376 20 16 17.5376 16 14.5C16 11.4624 13.5376 9 10.5 9C7.46243 9 5 11.4624 5 14.5C5 17.5376 7.46243 20 10.5 20Z"></path>
            </svg>
            Boy's
          </span>
        </div>
      </div>
      {/* ✅ Show Loading Skeleton */}
      {loading ? (
        <div className="ai-models-section-content-box-each">
          {[...Array(10)].map((_, index) => (
            <div className="ai-models-box-ys skeleton" key={index}>
              <Skeleton height={150} />
              <div className="ai-models-box-ys-content">
                <Skeleton width={80} />
                <Skeleton height={20} width="70%" />
                <Skeleton height={15} width="90%" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredModels.length === 0 ? (
        <p>No AI models found in this category.</p>
      ) : (
        <div className="ai-models-section-content-box-each">
          {filteredModels.map((model) => (
            <Link to={`/chatbox?chatId=${model._id}`} className="ai-models-box-ys" key={model._id}>
              <img src={model.avatar_img} alt={model.name} />
              <div className="ai-models-box-ys-content">
                <span>{model.age}</span>
                <h3>{model.name}</h3>
                <p>{model.description.split(" ").slice(0, 7).join(" ")}...</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomeAiModels;
