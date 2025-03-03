import React, { useEffect } from "react";
import "../styles/Home.css";
import HomeAiModels from "../components/HomeAiModels";
import StepsHome from "../components/StepsHome";
import HomeFAQ from "../components/HomeFAQ";
import HomeCosAi from "../components/HomeCosAi";
import Footer from "../components/Footer";

function Home() {
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

  return (
    <div className="home-container">
      <div className="home-hero-section">
        <div className="hero-text">
          <p>welcome to <span>HeartEcho</span></p>
          <h1 className="home-hero-title">
            Your Ai <img className="home-ismx3" src="/heartechor.png" alt="HeartEcho"/>, Your Rules <br></br> Build, Chat, Personalize
          </h1>
          <h2 className="home-hero-subtitle">
            HeartEcho revolutionizes conversations with pre-trained AI models
            and custom chatbots tailored just for you.
          </h2>
        </div>
      </div>

      <div className="ai-models-section-container">
          <HomeAiModels/>
       </div>

       <div className="home-custeomize-ai-section">
      <HomeCosAi/>
    </div>



   <div className="home-seteps-showcase">
      <StepsHome/>
    </div>

<div className="home-faq-section">
<HomeFAQ/>
  </div>

<div className="footer-decds">
<Footer/>

</div>
    </div>
  );
}

export default Home;
