'use client'; // Required for client-side features

import { useState, useEffect } from "react";
import "./UsersAdmin.css";
import {
  FaUser,
  FaTrash,
  FaEdit,
  FaStar,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaChartPie,
  FaChartLine,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import axios from "axios";
import api from "../../config/api";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Server-safe token access
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/user-dataw`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.userData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/users-administr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserStats(response.data.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      (filterType === "all" || user.user_type === filterType) &&
      (filterGender === "all" || user.gender === filterGender) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Chart data preparation
  const userTypeData = userStats
    ? [
        { name: "Subscribers", value: userStats.userStats.totalSubscribers },
        { name: "Free Members", value: userStats.userStats.totalFreeMembers },
      ]
    : [];

  const messageQuotaData = users
    .filter((user) => user.user_type === "free")
    .map((user) => ({
      name: user.name,
      value: user.messageQuota,
    }));

  const loginActivityData = userStats
    ? userStats.loginStats.map((stat) => ({
        day: stat.date,
        logins: stat.loginCount,
      }))
    : [];

  const colors = ["#00c49f", "#cf4185", "#ffbb28", "#ff8042"];

  return (
    <div className="dex-container">
      <div className="dex-header">
        <h2 className="dex-title">Users Administration</h2>
        <div className="dex-header-actions">
          <div className="dex-search-container">
            <FaSearch className="dex-search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              className="dex-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="dex-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="free">Free Users</option>
            <option value="subscriber">Subscribers</option>
          </select>
          <select
            className="dex-filter-select"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="dex-content-grid">
        <div className="dex-charts-grid">
          <div className="dex-chart-card">
            <h3>User Type Distribution <FaChartPie /></h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  startAngle={90}
                  endAngle={-270}
                >
                  {userTypeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}`}
                  contentStyle={{
                    background: "#2d2d2d",
                    border: "none",
                    color: "#e0e0e0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="dex-chart-card">
            <h3>Message Quota Usage (Free Users) <FaChartBar /></h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messageQuotaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#e0e0e0" />
                <YAxis stroke="#e0e0e0" />
                <Tooltip
                  contentStyle={{
                    background: "#2d2d2d",
                    border: "none",
                    color: "#e0e0e0",
                  }}
                />
                <Legend wrapperStyle={{ color: "#e0e0e0" }} />
                <Bar dataKey="value" fill="#cf4185" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="dex-chart-card">
            <h3>Login Activity Trend <FaChartLine /></h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={loginActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#e0e0e0" />
                <YAxis stroke="#e0e0e0" />
                <Tooltip
                  contentStyle={{
                    background: "#2d2d2d",
                    border: "none",
                    color: "#e0e0e0",
                  }}
                />
                <Legend wrapperStyle={{ color: "#e0e0e0" }} />
                <Line
                  type="monotone"
                  dataKey="logins"
                  stroke="#00c49f"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dex-users-section">
          <div className="dex-users-grid">
            {currentUsers.map((user) => (
              <div key={user._id} className="dex-user-card">
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="dex-user-avatar"
                />
                <div className="dex-user-content">
                  <h3>{user.name}</h3>
                  <p>Email: {user.email}</p>
                  <p>Type: {user.user_type}</p>
                  <p>Gender: {user.gender}</p>
                  <p>Age: {user.age}</p>
                  <p>Joined: {new Date(user.joinedAt).toLocaleDateString()}</p>
                  <p>Messages Quota: {user.messageQuota}</p>
                  <p>2FA: {user.twofactor ? "Enabled" : "Disabled"}</p>
                  <p>Interests: {user.selectedInterests?.join(", ") || "None"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="dex-pagination">
            <button
              className="dex-pagination-button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`dex-pagination-button ${
                  currentPage === i + 1 ? "dex-active" : ""
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="dex-pagination-button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersAdmin;