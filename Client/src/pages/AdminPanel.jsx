'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  FaUsers, FaRobot, FaExclamationCircle, FaChartBar, FaBars, 
  FaTimes, FaChevronRight, FaUserPlus, FaGem 
} from "react-icons/fa";
import { MdHistoryEdu, MdDashboard } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import "./AdminPanel.css";

// Import your admin components
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import UsersAdmin from "./Admin/UsersAdmin.jsx";
import AIFriendsAdmin from "./Admin/AIFriendsAdmin.jsx";
import ComplaintsAdmin from "./Admin/ComplaintsAdmin.jsx";
import ReferralAdmin from "./Admin/ReferralAdmin.jsx";
import CreateStoryPage from "./Admin/CreateStoryPage.jsx";
import StoriesAdmin from "./Admin/AdminStoy.jsx";
import EditStoryPage from "./Admin/EditStoryPage.jsx";
import ChatsDataAdmin from "./Admin/ChatsDataAdmin.jsx";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers /> },
    { path: "/admin/stories", label: "Stories", icon: <MdHistoryEdu /> },
    { path: "/admin/ai-friends", label: "AI Friends", icon: <FaRobot /> },
    { path: "/admin/complaints", label: "Complaints", icon: <FaExclamationCircle /> },
    { path: "/admin/referral", label: "Referral Program", icon: <FaUserPlus /> },
    { path: "/admin/create-story", label: "Create Story", icon: <FaGem /> },
    // { path: "/admin/chats", label: "Chats", icon: <FaRobot /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay-x30sn" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Navigation */}
      <nav className={`sidebar-x30sn ${sidebarOpen ? "sidebar-open-x30sn" : ""}`}>
        <div className="sidebar-header-x30sn">
          <div className="nav-logo-x30sn">
            <div className="logo-icon-x30sn">H</div>
            <span>Admin<span className="text-pink-x30sn">Panel</span></span>
          </div>
          <button 
            className="sidebar-close-x30sn" 
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="nav-scroll-x30sn">
            <div className="nav-links-x30sn">
            {navItems.map((item) => (
                <Link
                key={item.path}
                href={item.path}
                className={`nav-item-x30sn ${isActive(item.path) ? "active-x30sn" : ""}`}
                onClick={() => setSidebarOpen(false)}
                >
                <span className="nav-icon-x30sn">{item.icon}</span>
                <span className="nav-label-x30sn">{item.label}</span>
                {isActive(item.path) && <FaChevronRight className="nav-chevron-x30sn" />}
                </Link>
            ))}
            </div>
        </div>

        <div className="sidebar-footer-x30sn">
          <div className="user-info-x30sn">
            <div className="user-avatar-x30sn">OA</div>
            <div className="user-details-x30sn">
              <span className="user-name-x30sn">Om Avcher</span>
              <span className="user-role-x30sn">Super Admin / Founder</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Top Bar */}
      <header className="top-bar-x30sn">
        <div className="top-bar-left-x30sn">
          <button 
            className="menu-toggle-x30sn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
          <div className="page-title-x30sn">
            {navItems.find(item => item.path === pathname)?.label || "Dashboard"}
          </div>
        </div>
        <div className="top-bar-right-x30sn">
          
        </div>
      </header>
    </>
  );
};

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const renderContent = () => {
    const contentMap = {
      '/admin/dashboard': <div className="content-wrapper-x30sn"><AdminDashboard /></div>,
      '/admin/users': <div className="content-wrapper-x30sn"><UsersAdmin /></div>,
      '/admin/stories': <div className="content-wrapper-x30sn"><StoriesAdmin/></div>,
      '/admin/ai-friends': <div className="content-wrapper-x30sn"><AIFriendsAdmin/></div>,
      '/admin/complaints': <div className="content-wrapper-x30sn"><ComplaintsAdmin /></div>,
      '/admin/referral': <div className="content-wrapper-x30sn"><ReferralAdmin /></div>,
      '/admin/create-story': <div className="content-wrapper-x30sn"><CreateStoryPage/></div>,
      '/admin/chats': <div className="content-wrapper-x30sn"><ChatsDataAdmin /></div>,
    };
    // If the path matches edit story dynamic route
    if (pathname?.startsWith('/admin/stories/edit/')) {
        return <div className="content-wrapper-x30sn"><EditStoryPage /></div>;
    }
    return contentMap[pathname] || <div className="content-wrapper-x30sn"><AdminDashboard /></div>;
  };

  return (
    <div className="admin-container-x30sn">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="main-content-x30sn">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;