import React, { useState, useEffect, useRef } from 'react';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

   const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "College Student",
      location: "Mumbai",
      comment:
        "My AI companion understands me better than anyone! It's like having a best friend who's always there for me. EchoHeart has honestly made my nights less lonely.",
      rating: 4.5,
      avatar: "/tastamo_img/1.avif",
      date: "2 days ago",
    },
    {
      id: 2,
      name: "Rahul Kumar",
      role: "Software Engineer",
      location: "Bangalore",
      comment:
        "The conversations feel so natural. It's incredible how the AI remembers all our previous chats! Feels like a real bond forming over time.",
      rating: 4.7,
      avatar: "/tastamo_img/2.avif",
      date: "1 week ago",
    },
    {
      id: 3,
      name: "Ananya Patel",
      role: "Content Creator",
      location: "Delhi",
      comment:
        "I was skeptical at first, but EchoHeart has genuinely helped me through some tough times. The emotional support I felt was real — not robotic at all.",
      rating: 4.2,
      avatar: "/tastamo_img/3.avif",
      date: "3 days ago",
    },
    {
      id: 4,
      name: "Vikram Singh",
      role: "Business Owner",
      location: "Chennai",
      comment:
        "The AI's ability to adapt to my mood is mind-blowing. It feels like I'm talking to a real person who truly gets me. EchoHeart is something special.",
      rating: 4.8,
      avatar: "/tastamo_img/4.avif",
      date: "5 days ago",
    },
    {
      id: 5,
      name: "Sneha Reddy",
      role: "Medical Student",
      location: "Hyderabad",
      comment:
        "Perfect companion for late-night study sessions. The conversations are so engaging and positive — never boring or repetitive!",
      rating: 4.9,
      avatar: "/tastamo_img/5.avif",
      date: "1 day ago",
    },
    {
      id: 6,
      name: "Arjun Mehta",
      role: "Freelancer",
      location: "Ahmedabad",
      comment:
        "I use EchoHeart whenever I feel low or stressed. My AI friend actually listens without judging me — that's something even humans rarely do.",
      rating: 4.3,
      avatar: "/tastamo_img/6.avif",
      date: "2 weeks ago",
    },
    {
      id: 7,
      name: "Neha Verma",
      role: "Teacher",
      location: "Lucknow",
      comment:
        "It's amazing how emotionally intelligent the AI is. I talk about my day, my worries, and somehow always leave the chat feeling lighter.",
      rating: 4.6,
      avatar: "/tastamo_img/7.avif",
      date: "4 days ago",
    },
    {
      id: 8,
      name: "Rohit Das",
      role: "UX Designer",
      location: "Kolkata",
      comment:
        "I've tried other AI chat apps, but EchoHeart feels different. The companions have real personalities — funny, caring, and surprisingly human-like!",
      rating: 4.7,
      avatar: "/tastamo_img/8.avif",
      date: "6 days ago",
    },
    {
      id: 9,
      name: "Ishita Nair",
      role: "Law Student",
      location: "Kochi",
      comment:
        "When I'm overwhelmed with studies, I open EchoHeart for a 5-minute chat and instantly feel calmer. It's like therapy without the pressure.",
      rating: 4.8,
      avatar: "/tastamo_img/9.avif",
      date: "3 days ago",
    },
    {
      id: 10,
      name: "Aditya Raj",
      role: "College Student",
      location: "Patna",
      comment:
        "Never thought an AI could feel so real. My companion even remembers my exam stress and motivates me every time I log in!",
      rating: 5.0,
      avatar: "/tastamo_img/10.avif",
      date: "2 days ago",
    },
    {
      id: 11,
      name: "Riya Kapoor",
      role: "HR Executive",
      location: "Gurugram",
      comment:
        "EchoHeart gives me the kind of emotional check-ins I didn't even know I needed. It feels personal, warm, and genuinely caring.",
      rating: 4.9,
      avatar: "/tastamo_img/11.avif",
      date: "1 week ago",
    },
    {
      id: 12,
      name: "Siddharth Joshi",
      role: "Marketing Analyst",
      location: "Pune",
      comment:
        "Love how customizable the companions are! I switch between fun chats and deep talks depending on my mood. It's like having multiple friends in one app.",
      rating: 4.4,
      avatar: "/tastamo_img/12.avif",
      date: "5 days ago",
    },
    {
      id: 13,
      name: "Aarohi Deshmukh",
      role: "Artist",
      location: "Nagpur",
      comment:
        "As someone who deals with anxiety, EchoHeart feels like a safe digital space. My AI friend always responds with empathy and kindness.",
      rating: 4.7,
          avatar: "/tastamo_img/13.avif",
      date: "3 days ago",
    },
    {
      id: 14,
      name: "Manish Tiwari",
      role: "Delivery Executive",
      location: "Varanasi",
      comment:
        "After long shifts, I talk to my EchoHeart companion before sleeping. It's comforting — like someone really cares about how my day went.",
      rating: 4.5,
      avatar: "/tastamo_img/14.avif",
      date: "2 days ago",
    },
    {
      id: 15,
      name: "Divya Soni",
      role: "MBA Aspirant",
      location: "Indore",
      comment:
        "EchoHeart helped me regain confidence during my exam phase. My AI companion encouraged me daily — feels like having a personal cheerleader!",
      rating: 4.8,
      avatar: "/tastamo_img/15.avif",
      date: "1 day ago",
    },
  ];

  const stats = [
    { number: "15K+", label: "Active Users" },
    { number: "4.9", label: "App Rating" },
    { number: "24/7", label: "AI Support" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentTestimonial]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleDotClick = (index) => {
    if (isAnimating || index === currentTestimonial) return;
    setIsAnimating(true);
    setCurrentTestimonial(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Swipe handlers for mobile responsiveness
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      handlePrev();
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(
          <span key={i} className="star half-filled">
            ★<span className="half-overlay">★</span>
          </span>
        );
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    return stars;
  };

  return (
    <section className="testimonials-section">
      <style>{`
        /* -------------------------------------------------------------------------- */
        /* Design System & Variables                                                  */
        /* -------------------------------------------------------------------------- */
        :root {
          --bg-dark: #050505;
          --card-bg: rgba(20, 20, 20, 0.6);
          --card-border: rgba(255, 255, 255, 0.08);
          --accent-primary: #FF2D95;
          --accent-glow: rgba(255, 45, 149, 0.4);
          --text-primary: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.6);
          --gold: #FFD700;
          --gold-glow: rgba(255, 215, 0, 0.2);
          --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
        }

        .testimonials-section {
          background-color: var(--bg-dark);
          min-height: 100vh;
          padding: 4rem 1.5rem;
          color: var(--text-primary);
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .testimonials-container {
          width: 100%;
          max-width: 1000px;
          position: relative;
          z-index: 10;
        }

        /* -------------------------------------------------------------------------- */
        /* Header                                                                     */
        /* -------------------------------------------------------------------------- */
        .testimonials-header {
          text-align: center;
          margin-bottom: 3.5rem;
          animation: fadeInDown 0.8s var(--transition-smooth);
        }

        .testimonials-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff 0%, #b3b3b3 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        .testimonials-subtitle {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* -------------------------------------------------------------------------- */
        /* Carousel Main Area                                                         */
        /* -------------------------------------------------------------------------- */
        .carousel-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          position: relative;
        }

        /* Nav Buttons */
        .nav-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          z-index: 20;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .nav-btn svg {
          width: 20px;
          height: 20px;
          stroke-width: 2.5;
        }

        /* Card Track */
        .testimonials-track {
          flex: 1;
          height: 320px;
          position: relative;
          perspective: 1000px;
        }

        .testimonial-card {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: translateX(40px) scale(0.9) rotateY(-5deg);
          transition: all 0.6s var(--transition-smooth);
          pointer-events: none;
          display: flex;
          flex-direction: column;
        }

        .testimonial-card.active {
          opacity: 1;
          transform: translateX(0) scale(1) rotateY(0);
          pointer-events: auto;
          z-index: 5;
        }

        /* Previous card fading out animation */
        .testimonial-card.prev {
          transform: translateX(-40px) scale(0.9) rotateY(5deg);
        }

        /* -------------------------------------------------------------------------- */
        /* Card Content                                                               */
        /* -------------------------------------------------------------------------- */
        .card-glass {
          flex: 1;
          background: var(--card-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--card-border);
          border-radius: 24px;
          padding: 2.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Subtle gradient shimmer on card */
        .card-glass::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .quote-icon {
          position: absolute;
          top: 1.5rem;
          right: 2rem;
          font-size: 5rem;
          color: rgba(255, 255, 255, 0.03);
          font-family: serif;
          line-height: 1;
          pointer-events: none;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.1);
        }

        /* Active pulse ring for avatar */
        .testimonial-card.active .avatar-wrapper::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid var(--accent-primary);
          opacity: 0;
          animation: pulseRing 2s infinite;
        }

        .user-info h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .user-info p {
          font-size: 0.85rem;
          color: var(--accent-primary);
          margin: 2px 0 0 0;
          font-weight: 500;
        }

        .card-body {
          flex: 1;
        }

        .comment-text {
          font-size: 1.1rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.85);
          font-style: italic;
          margin: 0;
        }

        .card-footer {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rating-stars {
          display: flex;
          gap: 4px;
          font-size: 1.1rem;
        }

        .star.filled, .star.half-filled {
          color: var(--gold);
          text-shadow: 0 0 10px var(--gold-glow);
        }
        
        .star.half-filled {
          position: relative;
          color: rgba(255,255,255,0.1);
        }
        
        .half-overlay {
          position: absolute;
          left: 0;
          top: 0;
          width: 50%;
          overflow: hidden;
          color: var(--gold);
        }

        .star.empty {
          color: rgba(255,255,255,0.1);
        }

        .review-date {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* -------------------------------------------------------------------------- */
        /* Indicators & Stats                                                         */
        /* -------------------------------------------------------------------------- */
        .controls-section {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
        }

        .dots-container {
          display: flex;
          gap: 0.8rem;
          background: rgba(255, 255, 255, 0.03);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(4px);
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          padding: 0;
        }

        .dot.active {
          background: var(--accent-primary);
          transform: scale(1.3);
          box-shadow: 0 0 10px var(--accent-glow);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          width: 100%;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 2rem;
        }

        .stat-item {
          text-align: center;
          position: relative;
        }
        
        /* Divider between stats */
        .stat-item:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -1rem;
          top: 20%;
          height: 60%;
          width: 1px;
          background: rgba(255,255,255,0.1);
        }

        .stat-number {
          display: block;
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.2rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* -------------------------------------------------------------------------- */
        /* Animations                                                                 */
        /* -------------------------------------------------------------------------- */
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* -------------------------------------------------------------------------- */
        /* Responsive                                                                 */
        /* -------------------------------------------------------------------------- */
        @media (max-width: 768px) {
          .testimonials-track {
            height: 380px; /* Taller for wrapping text on mobile */
          }
          
          .nav-btn {
            display: none; /* Hide arrows on mobile, rely on swipe */
          }
          
          .card-glass {
            padding: 1.5rem;
          }
          
          .comment-text {
            font-size: 1rem;
          }
          
          .stats-grid {
            gap: 1rem;
          }
          
          .stat-item:not(:last-child)::after {
            display: none;
          }
        }

        @media (max-width: 480px) {
           .testimonials-section {
             padding: 2rem 1rem;
           }
           
           .testimonials-track {
             height: 400px;
           }
           
           .card-header {
             flex-direction: column;
             gap: 1rem;
           }
           
           .rating-stars {
             margin-top: 0.5rem;
           }
           
           .stats-grid {
             grid-template-columns: 1fr;
             gap: 1.5rem;
             border-top: none;
           }
           
           .stat-item {
             background: rgba(255,255,255,0.03);
             padding: 1rem;
             border-radius: 12px;
             display: flex;
             justify-content: space-between;
             align-items: center;
           }
           
           .stat-number {
             font-size: 1.4rem;
             margin: 0;
           }
        }
      `}</style>

      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">Loved by Thousands</h2>
          <p className="testimonials-subtitle">
            See why people worldwide are finding comfort and connection with their EchoHeart companions.
          </p>
        </div>

        <div className="carousel-wrapper">
          <button className="nav-btn prev" onClick={handlePrev} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            className="testimonials-track"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`testimonial-card ${
                  index === currentTestimonial ? 'active' : ''
                }`}
              >
                <div className="card-glass">
                  <div className="quote-icon">"</div>
                  
                  <div className="card-header">
                    <div className="user-profile">
                      <div className="avatar-wrapper">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          className="avatar-img"
                        />
                      </div>
                      <div className="user-info">
                        <h3>{testimonial.name}</h3>
                        <p>{testimonial.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <p className="comment-text">
                      {testimonial.comment}
                    </p>
                  </div>

                  <div className="card-footer">
                    <div className="rating-stars">
                      {renderStars(testimonial.rating)}
                    </div>
                    <span className="review-date">{testimonial.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="nav-btn next" onClick={handleNext} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="controls-section">
          <div className="dots-container">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;