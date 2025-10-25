'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../styles/NotFound.css';

function NotFound() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200
      }
    }
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 200,
        delay: 0.1
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="not-found-container"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Animated Background Elements */}
        <div className="background-elements">
          <motion.div 
            className="bg-circle circle-1"
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="bg-circle circle-2"
            animate={{ 
              y: [0, 15, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="bg-circle circle-3"
            animate={{ 
              x: [0, 10, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        <motion.div 
          className="not-found-content"
          variants={containerVariants}
        >
          {/* Logo */}
          <motion.div 
            className="logo-section"
            variants={itemVariants}
          >
            <div className="logo-wrapper">
              <motion.img 
                src="/heartechor.png" 
                alt="HeartEcho" 
                className="logo-image"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.5 }
                }}
              />
              <motion.h2 
                className="logo-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                HeartEcho
              </motion.h2>
            </div>
          </motion.div>

          {/* 404 Number */}
          <motion.div 
            className="error-number-section"
            variants={numberVariants}
          >
            <motion.h1 
              className="error-number"
              animate={{ 
                scale: [1, 1.05, 1],
                transition: { 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              404
            </motion.h1>
            <motion.div 
              className="number-glow"
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Content */}
          <motion.h2 
            className="error-title"
            variants={itemVariants}
          >
            Page Not Found
          </motion.h2>

          <motion.p 
            className="error-description"
            variants={itemVariants}
          >
            The page you&apos;re looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </motion.p>

          {/* Actions */}
          <motion.div 
            className="action-buttons"
            variants={itemVariants}
          >
            <motion.button 
              onClick={() => router.back()} 
              className="action-btn primary-btn"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span className="btn-text">Go Back</span>
              <div className="btn-glow"></div>
            </motion.button>

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link href="/" className="action-btn secondary-btn">
                <span className="btn-text">Return Home</span>
                <div className="btn-glow"></div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="not-found-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          © {new Date().getFullYear()} HeartEcho AI
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

export default NotFound;