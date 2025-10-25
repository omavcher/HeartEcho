'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import '../styles/StepsHome.css';

function StepsHome() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);

  const steps = [
    {
      number: 1,
      icon: "👤",
      title: "Select Your AI Companion",
      description: "Choose from our diverse range of pre-trained AI personalities or customize your own unique virtual partner.",
      image: "/icons/heart1.png",
      delay: 0.1
    },
    {
      number: 2,
      icon: "💬",
      title: "Engage in Meaningful Chats",
      description: "Experience natural conversations with personalized responses that evolve based on your interaction history.",
      image: "/icons/heart2.png",
      delay: 0.2,
      highlighted: true
    },
    {
      number: 3,
      icon: "🚀",
      title: "Expand Your Experience",
      description: "Unlock advanced features and integrate your AI companion across multiple platforms for seamless access.",
      image: "/icons/heart3.png",
      delay: 0.3
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 200
      }
    }
  };

  return (
    <div className="steps-wrapper" ref={containerRef}>
      <motion.div 
        className="step-container"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            className={`step-card ${step.highlighted ? 'highlighted' : ''}`}
            variants={cardVariants}
            whileHover={{ 
              y: -8,
              transition: { type: "spring", damping: 20, stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated Background Glow */}
            <div className="card-glow"></div>
            
            <div className="step-header">
              <motion.div 
                className="step-number"
                variants={iconVariants}
                transition={{ delay: step.delay + 0.1 }}
              >
                {step.number}
              </motion.div>
              <motion.div 
                className="step-icon"
                variants={iconVariants}
                transition={{ delay: step.delay + 0.2 }}
              >
                {step.icon}
              </motion.div>
            </div>

            <motion.h3 
              className="step-title"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: step.delay + 0.3 }}
            >
              {step.title}
            </motion.h3>

            <motion.p 
              className="step-description"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: step.delay + 0.4 }}
            >
              {step.description}
            </motion.p>

            <motion.div 
              className="step-image"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ 
                delay: step.delay + 0.5,
                type: "spring",
                damping: 20,
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                rotate: step.highlighted ? [0, -5, 5, 0] : 0,
                transition: { duration: 0.3 }
              }}
            >
              <img src={step.image} alt={`Step ${step.number}`} />
            </motion.div>

            {/* Progress Line (Desktop only) */}
            {index < steps.length - 1 && (
              <div className="step-connector">
                <motion.div 
                  className="connector-line"
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ delay: step.delay + 0.6, duration: 0.5 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default StepsHome;