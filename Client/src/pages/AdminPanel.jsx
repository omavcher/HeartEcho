'use client'; 
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaUsers, FaRobot, FaExclamationCircle, FaChartBar, FaBars } from "react-icons/fa";
import "./AdminPanel.css";
import AdminDashboard from "./admin/AdminDashboard";
import UsersAdmin from "./admin/UsersAdmin";
import AIFriendsAdmin from "./admin/AIFriendsAdmin";
import ComplaintsAdmin from "./admin/ComplaintsAdmin";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">Admin Panel</div>
      <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <FaBars />
      </div>
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link 
          href="/admin/dashboard" 
          className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          <FaChartBar /> Dashboard
        </Link>
        <Link 
          href="/admin/users" 
          className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          <FaUsers /> Users
        </Link>
        <Link 
          href="/admin/ai-friends" 
          className={`nav-item ${isActive('/admin/ai-friends') ? 'active' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          <FaRobot /> AI Friends
        </Link>
        <Link 
          href="/admin/complaints" 
          className={`nav-item ${isActive('/admin/complaints') ? 'active' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          <FaExclamationCircle /> Complaints
        </Link>
      </div>
    </nav>
  );
};

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

const AdminPanel = () => {
  const router = useRouter();
  
  // In Next.js, you might want to handle redirection differently
  // This could also be done with middleware or in layout files
  if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
    router.push('/admin/dashboard');
  }

  // Get current path to render the correct component
  const pathname = usePathname();
  
  const renderContent = () => {
    if (pathname === '/admin/dashboard') return <Dashboard />;
    if (pathname === '/admin/users') return <Users />;
    if (pathname === '/admin/ai-friends') return <AIFriends />;
    if (pathname === '/admin/complaints') return <Complaints />;
    return <Dashboard />; // default
  };

  return (
    <div className="admin-container">
      <Navbar />
      {renderContent()}
    </div>
  );
};

export default AdminPanel;