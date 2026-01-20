'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaUsers, FaRobot, FaExclamationCircle, FaChartBar, FaBars, FaTimes, FaChevronRight, FaUserPlus } from "react-icons/fa";
import "./AdminPanel.css";
import { MdHistoryEdu } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

// Import your admin components
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import UsersAdmin from "./Admin/UsersAdmin.jsx";
import AIFriendsAdmin from "./Admin/AIFriendsAdmin.jsx";
import ComplaintsAdmin from "./Admin/ComplaintsAdmin.jsx";
import ReferralAdmin from "./Admin/ReferralAdmin.jsx";
import CreateStoryPage from "./Admin/CreateStoryPage.jsx";
import StoriesAdmin from "./Admin/AdminStoy.jsx";
import EditStoryPage from "./Admin/EditStoryPage.jsx";
import ChatsData from "./Admin/ChatsData.jsx";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <FaChartBar /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers /> },
    { path: "/admin/stories", label: "Stories", icon: <MdHistoryEdu/> }, // Add this
    { path: "/admin/ai-friends", label: "AI Friends", icon: <FaRobot /> },
    { path: "/admin/complaints", label: "Complaints", icon: <FaExclamationCircle /> },
    { path: "/admin/referral", label: "Referral Program", icon: <FaUserPlus /> },
    { path: "/admin/create-story", label: "Create Story", icon: <MdHistoryEdu /> },
    { path: "/admin/stories/edit/:id", label: "Edit Story", icon: <CiEdit /> },
    { path: "/admin/chats-data", label: "Chats", icon: <FaRobot /> },

  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Navigation */}
      <nav className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="nav-logo">
            <div className="logo-icon">⚡</div>
            <span>Admin Panel</span>
          </div>
          <button 
            className="sidebar-close" 
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <FaChevronRight className="nav-chevron" />
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">A</div>
            <div className="user-details">
              <span className="user-name">Admin User</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
          <div className="page-title">
            {navItems.find(item => item.path === pathname)?.label || "Dashboard"}
          </div>
        </div>
        <div className="top-bar-right">
          <div className="nav-logo-mobile">
            <span>Admin</span>
          </div>
        </div>
      </header>
    </>
  );
};

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle redirect from /admin to /admin/dashboard
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // In AdminPanel.jsx
const renderContent = () => {
  const contentMap = {
    '/admin/dashboard': <Dashboard />,
    '/admin/users': <Users />,
    '/admin/stories': <StoriesAdmin/>,
    '/admin/ai-friends': <AIFriends />,
    '/admin/complaints': <Complaints />,
    '/admin/referral': <Referral />,
    '/admin/create-story': <CreateStoryPage/>,
    '/admin/chat-data': <ChatsData/>,

  };
  return contentMap[pathname] || <Dashboard />;
};

  return (
    <div className="admin-container">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

// Content Components
const Dashboard = () => (
  <div className="content">
    <AdminDashboard /> 
  </div>
);

const Users = () => (
  <div className="content">
    <UsersAdmin />
  </div>
);

const AIFriends = () => (
  <div className="content">
    <AIFriendsAdmin/>
  </div>
);

const Complaints = () => (
  <div className="content">
    <ComplaintsAdmin />
  </div>
);

const Referral = () => (
  <div className="content">
    <ReferralAdmin />
  </div>
);

const ChatsData = () => (
  <div className="content">
    <ChatsData />
  </div>
);

export default AdminPanel;