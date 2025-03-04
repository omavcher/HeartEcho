import React, { useState } from "react";
import "./AIFriendsAdmin.css"; // Import local CSS
import { FaRobot, FaTrash, FaEdit, FaSearch, FaClone } from "react-icons/fa";

const AIFriendsAdmin = () => {
  // Sample data based on prebuiltAIFriendSchema (only male and female)
  const sampleAIFriends = [
    {
      _id: "1",
      gender: "male",
      relationship: "Best Friend",
      interests: ["Technology", "Gaming", "Music"],
      age: "Young",
      name: "AlexBot",
      description: "A tech-savvy AI friend who loves gaming and music.",
      settings: { responseTime: "fast", tone: "friendly" },
      initial_message: "Hey, want to play a game or chat about tech?",
      avatar_img: "https://via.placeholder.com/50",
      isActive: true,
    },
    {
      _id: "2",
      gender: "female",
      relationship: "Confidant",
      interests: ["Reading", "Travel", "Art"],
      age: "Mature",
      name: "LaraAI",
      description: "A wise AI friend for deep conversations and travel tips.",
      settings: { responseTime: "moderate", tone: "calm" },
      initial_message: "Hello, let’s talk about your next adventure!",
      avatar_img: "https://via.placeholder.com/50",
      isActive: false,
    },
    {
      _id: "4",
      gender: "male",
      relationship: "Companion",
      interests: ["Cooking", "Fitness", "Movies"],
      age: "Teen",
      name: "MaxAI",
      description: "A youthful AI friend for fun activities and movies.",
      settings: { responseTime: "fast", tone: "energetic" },
      initial_message: "Yo, let’s cook up something cool or watch a movie!",
      avatar_img: "https://via.placeholder.com/50",
      isActive: false,
    },
  ];

  const [aiFriends, setAIFriends] = useState(sampleAIFriends);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("male"); // Default to male

  // Filter AI friends based on search and selected gender
  const filteredAIFriends = aiFriends
    .filter((friend) => friend.gender === selectedGender)
    .filter((friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle AI friend actions (simulated for now)
  const handleDelete = (id) => {
    setAIFriends(aiFriends.filter((friend) => friend._id !== id));
    alert(`AI Friend with ID ${id} deleted successfully!`);
  };

  const handleEdit = (friend) => {
    alert(`Edit AI Friend: ${friend.name} (ID: ${friend._id})`);
    // Add your edit logic here (e.g., open a modal or form)
  };

  const handleClone = (friend) => {
    const clonedFriend = {
      ...friend,
      _id: `${friend._id}-clone-${Math.random().toString(36).substr(2, 9)}`,
      name: `${friend.name} Clone`,
      isActive: false,
    };
    setAIFriends([...aiFriends, clonedFriend]);
    alert(`AI Friend ${friend.name} cloned successfully!`);
  };

  const handleToggleActive = (friend) => {
    setAIFriends(
      aiFriends.map((f) =>
        f._id === friend._id ? { ...f, isActive: !f.isActive } : f
      )
    );
    alert(`AI Friend ${friend.name} ${friend.isActive ? "deactivated" : "activated"}!`);
  };

  return (
    <div className="fif-container">
      <div className="fif-header">
        <h2 className="fif-title">AI Friends Administration</h2>
        <div className="fif-header-actions">
          <div className="fif-search-container">
            <FaSearch className="fif-search-icon" />
            <input
              type="text"
              placeholder="Search AI friends..."
              className="fif-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="fif-gender-select"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="male">Male AI Friends</option>
            <option value="female">Female AI Friends</option>
          </select>
        </div>
      </div>

      <div className="fif-content-grid">
        <div className="fif-friends-section">
          <div className="fif-friends-grid">
            {filteredAIFriends.map((friend) => (
              <div key={friend._id} className="fif-friend-card">
                <img src={friend.avatar_img} alt={friend.name} className="fif-friend-avatar" />
                <div className="fif-friend-content">
                  <h3>{friend.name}</h3>
                  <p>Relationship: {friend.relationship}</p>
                  <p>Age: {friend.age}</p>
                  <p>Interests: {friend.interests.join(", ")}</p>
                  <p>Description: {friend.description}</p>
                  <p>Initial Message: {friend.initial_message}</p>
                  <p>Status: {friend.isActive ? "Active" : "Inactive"}</p>
                  <div className="fif-friend-actions">
                    <button
                      className="fif-action-button fif-edit"
                      onClick={() => handleEdit(friend)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="fif-action-button fif-delete"
                      onClick={() => handleDelete(friend._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                    <button
                      className="fif-action-button fif-clone"
                      onClick={() => handleClone(friend)}
                    >
                      <FaClone /> Clone
                    </button>
                    <button
                      className="fif-action-button fif-toggle"
                      onClick={() => handleToggleActive(friend)}
                    >
                      {friend.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFriendsAdmin;