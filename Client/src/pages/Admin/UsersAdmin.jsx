import React, { useState, useEffect } from "react";
import "./UsersAdmin.css"; // Import local CSS
import {
  FaUser,
  FaTrash,
  FaEdit,
  FaStar,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaChartPie,
} from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
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

const UsersAdmin = () => {
  // Expanded sample data based on userSchema
  const sampleUsers = [
    {
      _id: "1",
      profile_picture: "https://via.placeholder.com/50",
      name: "John Doe",
      email: "john.doe@example.com",
      phone_number: "123-456-7890",
      gender: "male",
      birth_date: new Date("1990-05-15"),
      age: 34,
      password: "hashedpassword123", // Typically hashed in real apps
      interests: ["Technology", "Gaming"],
      user_type: "free",
      twofactor: false,
      referralCode: "REF123",
      termsAccepted: true,
      subscribeNews: true,
      selectedInterests: ["AI", "Music"],
      joinedAt: new Date("2024-01-01"),
      messageQuota: 10,
      payment_history: [{ amount: 50, date: new Date("2024-02-01") }],
      login_details: [{ timestamp: new Date("2024-03-01"), ip: "192.168.1.1" }],
      tickets: [{ title: "Support Issue", status: "open" }],
      chats: [{ lastMessage: "Hello", timestamp: new Date("2024-03-02") }],
      ai_friends: [{ name: "AI Buddy", type: "Chatbot" }],
    },
    {
      _id: "2",
      profile_picture: "https://via.placeholder.com/50",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone_number: "098-765-4321",
      gender: "female",
      birth_date: new Date("1995-08-20"),
      age: 29,
      password: "hashedpassword456",
      interests: ["Reading", "Travel"],
      user_type: "subscriber",
      twofactor: true,
      referralCode: "REF456",
      termsAccepted: true,
      subscribeNews: false,
      selectedInterests: ["Fitness", "Art"],
      joinedAt: new Date("2024-03-01"),
      messageQuota: 50,
      payment_history: [{ amount: 100, date: new Date("2024-03-15") }],
      login_details: [{ timestamp: new Date("2024-03-10"), ip: "192.168.1.2" }],
      tickets: [{ title: "Billing Issue", status: "closed" }],
      chats: [{ lastMessage: "Help needed", timestamp: new Date("2024-03-12") }],
      ai_friends: [{ name: "AI Companion", type: "Virtual Friend" }],
    },
    {
      _id: "3",
      profile_picture: "https://via.placeholder.com/50",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone_number: "555-555-5555",
      gender: "Other",
      birth_date: new Date("1988-12-10"),
      age: 36,
      password: "hashedpassword789",
      interests: ["Photography", "Cooking"],
      user_type: "free",
      twofactor: false,
      referralCode: "REF789",
      termsAccepted: false,
      subscribeNews: true,
      selectedInterests: ["Science", "Sports"],
      joinedAt: new Date("2024-02-15"),
      messageQuota: 10,
      payment_history: [],
      login_details: [{ timestamp: new Date("2024-03-05"), ip: "192.168.1.3" }],
      tickets: [{ title: "Feature Request", status: "open" }],
      chats: [{ lastMessage: "Thanks!", timestamp: new Date("2024-03-08") }],
      ai_friends: [{ name: "AI Helper", type: "Assistant" }],
    },
    {
      _id: "4",
      profile_picture: "https://via.placeholder.com/50",
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      phone_number: "777-888-9999",
      gender: "female",
      birth_date: new Date("1992-03-25"),
      age: 32,
      password: "hashedpasswordabc",
      interests: ["Music", "Dance"],
      user_type: "subscriber",
      twofactor: true,
      referralCode: "REFABC",
      termsAccepted: true,
      subscribeNews: false,
      selectedInterests: ["Travel", "Food"],
      joinedAt: new Date("2024-01-15"),
      messageQuota: 50,
      payment_history: [{ amount: 75, date: new Date("2024-02-20") }],
      login_details: [{ timestamp: new Date("2024-03-15"), ip: "192.168.1.4" }],
      tickets: [{ title: "Account Issue", status: "closed" }],
      chats: [{ lastMessage: "Hi there", timestamp: new Date("2024-03-18") }],
      ai_friends: [{ name: "AI Mentor", type: "Coach" }],
    },
  ];

  const [users, setUsers] = useState(sampleUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // Filter by user_type
  const [filterGender, setFilterGender] = useState("all"); // Filter by gender
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;

  // Filter users based on search, type, and gender
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || user.user_type === filterType;
    const matchesGender =
      filterGender === "all" || user.gender === filterGender;
    return matchesSearch && matchesType && matchesGender;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle user actions (simulated for now)
  const handleDelete = (id) => {
    setUsers(users.filter((user) => user._id !== id));
    alert(`User with ID ${id} deleted successfully!`);
  };

  const handleEdit = (user) => {
    alert(`Edit user: ${user.name} (ID: ${user._id})`);
    // Add your edit logic here (e.g., open a modal or form)
  };

  const handleUpgrade = (user) => {
    setUsers(
      users.map((u) =>
        u._id === user._id ? { ...u, user_type: "subscriber", messageQuota: 50 } : u
      )
    );
    alert(`User ${user.name} upgraded to subscriber!`);
  };

  // Data for charts
  const userTypeData = [
    { name: "Free Users", value: users.filter((u) => u.user_type === "free").length },
    { name: "Subscribers", value: users.filter((u) => u.user_type === "subscriber").length },
  ];

  const messageQuotaData = [
    { name: "Used Quota", value: users.reduce((sum, u) => sum + (u.messageQuota - 10), 0) }, // Assuming 10 is default free quota
    { name: "Remaining Quota", value: users.reduce((sum, u) => sum + 10, 0) }, // Default remaining quota per user
  ];

  const loginActivityData = [
    { day: "Mon", logins: Math.floor(Math.random() * 50) + 20 },
    { day: "Tue", logins: Math.floor(Math.random() * 50) + 20 },
    { day: "Wed", logins: Math.floor(Math.random() * 50) + 20 },
    { day: "Thu", logins: Math.floor(Math.random() * 50) + 20 },
    { day: "Fri", logins: Math.floor(Math.random() * 50) + 20 },
    { day: "Sat", logins: Math.floor(Math.random() * 50) + 20 },
    { day: "Sun", logins: Math.floor(Math.random() * 50) + 20 },
  ];

  const colors = ["#cf4185", "#00c49f", "#4a90e2", "#ffcc00", "#ff4b5c", "#6ab0ff"];

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
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  startAngle={90}
                  endAngle={-270}
                >
                  {userTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}`}
                  contentStyle={{ background: "#2d2d2d", border: "none", color: "#e0e0e0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="dex-chart-card">
            <h3>Message Quota Usage <FaChartBar /></h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messageQuotaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#e0e0e0" />
                <YAxis stroke="#e0e0e0" />
                <Tooltip
                  contentStyle={{ background: "#2d2d2d", border: "none", color: "#e0e0e0" }}
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
                  contentStyle={{ background: "#2d2d2d", border: "none", color: "#e0e0e0" }}
                />
                <Legend wrapperStyle={{ color: "#e0e0e0" }} />
                <Line type="monotone" dataKey="logins" stroke="#00c49f" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dex-users-section">
          <div className="dex-users-grid">
            {currentUsers.map((user) => (
              <div key={user._id} className="dex-user-card">
                <img src={user.profile_picture} alt={user.name} className="dex-user-avatar" />
                <div className="dex-user-content">
                  <h3>{user.name}</h3>
                  <p>Email: {user.email}</p>
                  <p>Type: {user.user_type}</p>
                  <p>Gender: {user.gender}</p>
                  <p>Age: {user.age}</p>
                  <p>Joined: {new Date(user.joinedAt).toLocaleDateString()}</p>
                  <p>Messages Quota: {user.messageQuota}</p>
                  <p>2FA: {user.twofactor ? "Enabled" : "Disabled"}</p>
                  <p>Interests: {user.interests.join(", ")}</p>
                  <div className="dex-user-actions">
                    <button
                      className="dex-action-button dex-edit"
                      onClick={() => handleEdit(user)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="dex-action-button dex-delete"
                      onClick={() => handleDelete(user._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                    {user.user_type === "free" && (
                      <button
                        className="dex-action-button dex-upgrade"
                        onClick={() => handleUpgrade(user)}
                      >
                        <FaStar /> Upgrade
                      </button>
                    )}
                  </div>
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
                className={`dex-pagination-button ${currentPage === i + 1 ? "dex-active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="dex-pagination-button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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