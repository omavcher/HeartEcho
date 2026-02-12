'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import '../styles/StepsHome.css';

function StepsHome() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);

  const steps = [
    {
      number: 1,
      icon: "👤",
      title: "Select Companion",
      description: "Choose from diverse AI personalities or customize your unique virtual partner.",
      image: "/icons/heart1.png",
      delay: 0.1
    },
    {
      number: 2,
      icon: "💬",
      title: "Chat & Connect",
      description: "Engage in deep, meaningful conversations that evolve with every message.",
      image: "/icons/heart2.png",
      delay: 0.2,
      highlighted: true
    },
    {
      number: 3,
      icon: "🚀",
      title: "Level Up",
      description: "Unlock exclusive features and deepen the bond as your relationship grows.",
      image: "/icons/heart3.png",
      delay: 0.3
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1, 
      transition: { type: "spring", damping: 25, stiffness: 200 } 
    }
  };

  return (
    <section className="sth-root-x30sn" ref={containerRef}>
      <div className="sth-header-x30sn">
        <h2 className="sth-main-title-x30sn">How It <span className="text-pink-x30sn">Works</span></h2>
        <p className="sth-subtitle-x30sn">Start your journey in three simple steps</p>
      </div>

      <motion.div 
        className="sth-scroll-container-x30sn"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            className={`sth-card-x30sn ${step.highlighted ? 'highlighted' : ''}`}
            variants={cardVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="sth-card-bg-glow-x30sn"></div>
            
            <div className="sth-card-top-x30sn">
              <span className="sth-step-num-x30sn">{step.number}</span>
              <span className="sth-icon-x30sn">{step.icon}</span>
            </div>

            <div className="sth-content-x30sn">
              <h3 className="sth-title-x30sn">{step.title}</h3>
              <p className="sth-desc-x30sn">{step.description}</p>
            </div>

            <div className="sth-img-box-x30sn">
               {/* Replace src with actual image path or keep placeholder logic */}
              <img src={step.image} alt={step.title} onError={(e) => e.target.style.display='none'} />
              <div className="sth-img-fallback-x30sn"></div> 
            </div>

            {/* Connecting Line (Desktop Only visual) */}
            {index < steps.length - 1 && <div className="sth-connector-x30sn"></div>}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default StepsHome;