'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import '../styles/AIFriends.css';
import Link from "next/link";
import "react-loading-skeleton/dist/skeleton.css";
import api from "../config/api";

function AIFriends() {
  const [aiModels, setAiModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [ageRange, setAgeRange] = useState([18, 50]);
  const [relationshipFilter, setRelationshipFilter] = useState("all");

  useEffect(() => {
    axios
      .get(`${api.Url}/user/get-pre-ai`)
      .then((response) => {
        setAiModels(response.data.data);
        setFilteredModels(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load AI models. Please try again.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = aiModels;
    
    if (activeTab !== "all") {
      filtered = filtered.filter(model => model.gender === activeTab);
    }
    
    filtered = filtered.filter(model => 
      model.age >= ageRange[0] && model.age <= ageRange[1]
    );
    
    if (relationshipFilter !== "all") {
      filtered = filtered.filter(model => 
        model.relationship.toLowerCase().includes(relationshipFilter.toLowerCase())
      );
    }
    
    setFilteredModels(filtered);
  }, [activeTab, ageRange, relationshipFilter, aiModels]);

  const relationshipTypes = [...new Set(aiModels.map(model => model.relationship))];

  return (
    <div className="ai-container">

      {error && <div className="ai-error">{error}</div>}

      <div className="ai-filters">
        <div className="filter-group">
          <label>Gender</label>
          <div className="filter-options">
            {['all', 'female', 'male'].map(gender => (
              <button
                key={gender}
                className={activeTab === gender ? 'active' : ''}
                onClick={() => setActiveTab(gender)}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Age: {ageRange[0]} - {ageRange[1]}</label>
          <div className="range-slider">
            <input
              type="range"
              min="18"
              max="50"
              value={ageRange[0]}
              onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
            />
            <input
              type="range"
              min="18"
              max="50"
              value={ageRange[1]}
              onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Personality</label>
          <select
            value={relationshipFilter}
            onChange={(e) => setRelationshipFilter(e.target.value)}
          >
            <option value="all">All Personalities</option>
            {relationshipTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ai-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div className="ai-card skeleton" key={index}>
              <Skeleton height={300} />
              <div className="ai-card-content">
                <Skeleton width={100} />
                <Skeleton width={60} />
                <Skeleton count={2} />
              </div>
            </div>
          ))
        ) : filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <Link href={`/chatbox?chatId=${model._id}`} className="ai-card" key={model._id}>
              <div className="ai-card-image">
                <img src={model.avatar_img} alt={model.name} />
                <span className="ai-age">{model.age}</span>
              </div>
              <div className="ai-card-content">
                <div className="ai-card-header">
                  <h3>{model.name}</h3>
                  <span className="ai-relationship">{model.relationship}</span>
                </div>
                <p>{model.description.split(" ").slice(0, 12).join(" ")}...</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="ai-empty">
            No matches found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFriends;