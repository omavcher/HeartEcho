'use client'; // Required for client-side features

import { useState, useEffect } from "react";
import "./AIFriendsAdmin.css";
import { FaRobot, FaTrash, FaEdit, FaSearch, FaPlus } from "react-icons/fa";
import api from '../../config/api';
import axios from "axios";

const AIFriendsAdmin = () => {
  const [aiFriends, setAIFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("female");
  const [editFriend, setEditFriend] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  // Server-safe token access
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  useEffect(() => {
    fetchAIFriends();
  }, []);

  const fetchAIFriends = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/aiuser-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAIFriends(response.data.aiusers);
      console.log(`fetchAIFriends response ${JSON.stringify(response.data.aiusers)}`);
    } catch (error) {
      console.error("Error fetching AI friends:", error);
    }
  };

  // Calculate counts
  const totalCount = aiFriends.length;
  const maleCount = aiFriends.filter(friend => friend.gender === "male").length;
  const femaleCount = aiFriends.filter(friend => friend.gender === "female").length;

  // Filter AI friends based on search and selected gender
  const filteredAIFriends = aiFriends
    .filter((friend) => friend.gender === selectedGender)
    .filter((friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle Delete with Confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this AI Friend?");
    if (confirmDelete) {
      try {
        const token = getToken();
        await axios.delete(`${api.Url}/admin/aiuser-data/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAIFriends(aiFriends.filter((friend) => friend._id !== id));
        alert("AI Friend deleted successfully!");
      } catch (error) {
        console.error("Error deleting AI Friend:", error);
        alert("Failed to delete AI Friend.");
      }
    }
  };

  // Handle Edit - Open Modal
  const handleEdit = (friend) => {
    setEditFriend({ ...friend });
  };

  // Handle Edit Form Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await axios.put(
        `${api.Url}/admin/aiuser-data/${editFriend._id}`,
        editFriend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAIFriends(aiFriends.map((f) =>
        f._id === editFriend._id ? response.data : f
      ));
      setEditFriend(null);
      alert("AI Friend updated successfully!");
    } catch (error) {
      console.error("Error updating AI Friend:", error);
      alert("Failed to update AI Friend.");
    }
  };

  // Handle Add Multiple AI Friends
  const handleAddMultiple = async () => {
    try {
      const token = getToken();
      const parsedData = JSON.parse(jsonInput);
      const response = await axios.post(
        `${api.Url}/admin/put-alldata/multipel`,
        parsedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAIFriends([...aiFriends, ...response.data.data]);
      setJsonInput("");
      setShowAddSection(false);
      alert("Multiple AI Friends added successfully!");
    } catch (error) {
      console.error("Error adding multiple AI Friends:", error);
      alert("Failed to add AI Friends. Please check your JSON format.");
    }
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
          <button
            className="fif-action-button fif-add"
            onClick={() => setShowAddSection(!showAddSection)}
          >
            <FaPlus /> Add Multiple AI Friends
          </button>
        </div>
      </div>

      {/* Display Counts */}
      <div className="fif-counts">
        <p>Total AI Friends: {totalCount}</p>
        <p>Male AI Friends: {maleCount}</p>
        <p>Female AI Friends: {femaleCount}</p>
      </div>

      {/* Add Multiple AI Friends Section */}
      {showAddSection && (
        <div className="fif-add-section">
          <h3>Add Multiple AI Friends (JSON)</h3>
          <textarea
            className="fif-json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste JSON array here, e.g., [{"gender": "female", "name": "Aaradhya", ...}]'
            rows="10"
            cols="50"
          />
          <div>
            <button
              className="fif-action-button fif-save"
              onClick={handleAddMultiple}
            >
              Save
            </button>
            <button
              className="fif-action-button fif-cancel"
              onClick={() => setShowAddSection(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="fif-content-grid">
        <div className="fif-friends-section">
          <div className="fif-friends-grid">
            {filteredAIFriends.length > 0 ? (
              filteredAIFriends.map((friend) => (
                <div key={friend._id} className="fif-friend-card">
                  <img 
                    src={friend.avatar_img} 
                    alt={friend.name} 
                    className="fif-friend-avatar" 
                    onError={(e) => {
                      e.target.src = '/default-avatar.png'; // Fallback image
                    }}
                  />
                  <div className="fif-friend-content">
                    <h3>{friend.name}</h3>
                    <p>Relationship: {friend.relationship}</p>
                    <p>Age: {friend.age}</p>
                    <p>Interests: {friend.interests?.join(", ") || "None specified"}</p>
                    <p>Description: {friend.description}</p>
                    <p>Initial Message: {friend.initial_message}</p>
                    <p>Persona: {friend.settings?.persona || "Not specified"}</p>
                    <p>Setting: {friend.settings?.setting || "Not specified"}</p>
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No AI Friends found for the selected gender.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editFriend && (
        <div className="fif-modal">
          <div className="fif-modal-content">
            <h3>Edit AI Friend: {editFriend.name}</h3>
            <form onSubmit={handleEditSubmit}>
              <label>Name:</label>
              <input
                type="text"
                value={editFriend.name}
                onChange={(e) => setEditFriend({ ...editFriend, name: e.target.value })}
                required
              />
              <label>Gender:</label>
              <select
                value={editFriend.gender}
                onChange={(e) => setEditFriend({ ...editFriend, gender: e.target.value })}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <label>Relationship:</label>
              <input
                type="text"
                value={editFriend.relationship}
                onChange={(e) => setEditFriend({ ...editFriend, relationship: e.target.value })}
                required
              />
              <label>Age:</label>
              <input
                type="number"
                value={editFriend.age}
                onChange={(e) => setEditFriend({ ...editFriend, age: e.target.value })}
                min="18"
                required
              />
              <label>Interests (comma-separated):</label>
              <input
                type="text"
                value={editFriend.interests?.join(", ") || ""}
                onChange={(e) => setEditFriend({ 
                  ...editFriend, 
                  interests: e.target.value.split(",").map(item => item.trim()) 
                })}
              />
              <label>Description:</label>
              <textarea
                value={editFriend.description}
                onChange={(e) => setEditFriend({ ...editFriend, description: e.target.value })}
                required
              />
              <label>Initial Message:</label>
              <input
                type="text"
                value={editFriend.initial_message}
                onChange={(e) => setEditFriend({ ...editFriend, initial_message: e.target.value })}
                required
              />
              <label>Persona:</label>
              <input
                type="text"
                value={editFriend.settings?.persona || ""}
                onChange={(e) => setEditFriend({ 
                  ...editFriend, 
                  settings: { 
                    ...editFriend.settings, 
                    persona: e.target.value 
                  } 
                })}
              />
              <label>Setting:</label>
              <input
                type="text"
                value={editFriend.settings?.setting || ""}
                onChange={(e) => setEditFriend({ 
                  ...editFriend, 
                  settings: { 
                    ...editFriend.settings, 
                    setting: e.target.value 
                  } 
                })}
              />
              <label>Avatar URL:</label>
              <input
                type="text"
                value={editFriend.avatar_img}
                onChange={(e) => setEditFriend({ ...editFriend, avatar_img: e.target.value })}
                required
              />
              <div className="fif-modal-buttons">
                <button type="submit" className="fif-action-button fif-save">Save</button>
                <button
                  type="button"
                  className="fif-action-button fif-cancel"
                  onClick={() => setEditFriend(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFriendsAdmin;