import { useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import '../styles/PopNoti.css';

function PopNoti({ message, type, isVisible, onClose }) {

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer); // Cleanup on unmount or when isVisible changes
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`pop-noti ${type}`} // Apply CSS classes based on type
        >
          <span>{message}</span>
          <button onClick={onClose} className="close-btn-pop-btns">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PopNoti;
