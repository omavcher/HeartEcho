import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import SideMenu from "./components/SideMenu.jsx";
import MobileMenu from "./components/MobileMenu.jsx";
import Discover from "./pages/Discover.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProfileDashboard from "./pages/ProfileDashboard.jsx";
import Create from "./pages/Create.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Subscribe from "./pages/Subscribe.jsx";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the protected route component
import AdminPanel from "./pages/AdminPanel.jsx";
import Refund from "./pages/Refund.jsx";
import Terms from "./pages/Terms.jsx";
import Shipping from "./pages/Shipping.jsx";
import Privacy from "./pages/Privacy.jsx";
import Products from "./pages/Products.jsx";
import Contact from "./pages/Contact.jsx";
import ThankYou from "./pages/ThankYou.jsx";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Default check




  useEffect(() => {
    document.title = "HeartEcho – The Future of Personalized AI Conversations";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "HeartEcho brings AI chatbots to life with cutting-edge pre-trained models, personalized AI assistants, and an intuitive chat experience."
      );
    }
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // const disableRightClick = (e) => e.preventDefault();
    // const disableKeyShortcuts = (e) => {
    //   if (
    //     e.key === "F12" || 
    //     (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key)) ||
    //     (e.ctrlKey && ["S", "U"].includes(e.key))
    //   ) {
    //     e.preventDefault();
    //   }
    // };

    // // Disable right-click
    // document.addEventListener("contextmenu", disableRightClick);

    // // Disable keyboard shortcuts
    // document.addEventListener("keydown", disableKeyShortcuts);

    // // Disable image dragging
    // document.querySelectorAll("img").forEach((img) => {
    //   img.setAttribute("draggable", "false");
    // });

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeyShortcuts);
    };
  }, []);

  return (
    <>
      <div className="main-container-d min-h-screen flex justify-center items-center bg-gray-100">
        {!isMobile && <SideMenu />} {/* Show SideMenu on large screens */}
        <div className="mainx-swdeer">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/products" element={<Products />} />
        <Route path="/contact" element={<Contact />} />

        <Route
  path="/admin/*"
  element={
    <ProtectedRoute adminOnly={true}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>


{/* 🔒 Protected Routes */}
<Route
    path="/profile"
    element={
      <ProtectedRoute>
        <ProfileDashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/create"
    element={
      <ProtectedRoute>
        <Create />
      </ProtectedRoute>
    }
  />

<Route
    path="/chatbox"
    element={
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    }
  />

<Route
    path="/subscribe"
    element={
      <ProtectedRoute>
        <Subscribe />
      </ProtectedRoute>
    }
  />
  <Route
    path="/thank-you"
    element={
      <ProtectedRoute>
        <ThankYou />
      </ProtectedRoute>
    }
  />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      {isMobile && <MobileMenu />} {/* Show MobileMenu on small screens */}
    </>
  );
}

export default App;
