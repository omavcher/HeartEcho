'use client';
import { useState, useEffect } from 'react';
import './Testimonials.css';
import Image from 'next/image';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Stats data
  const stats = [
    { number: "15K+", label: "Active Users" },
    { number: "4.7", label: "Average Rating" },
    { number: "24/7", label: "Support" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTestimonial]);

  const handleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentTestimonial((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleDotClick = (index) => {
    if (isAnimating || index === currentTestimonial) return;
    
    setIsAnimating(true);
    setCurrentTestimonial(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    const hasPartialStar = rating % 1 > 0.7;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="star filled">
          ★
        </span>
      );
    }

    // Half star
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <span key="half" className="star half-filled">
          <span className="star-half">★</span>
        </span>
      );
    }

    // Partial star (treat as full if more than 0.7)
    if (hasPartialStar && fullStars < 5) {
      stars.push(
        <span key="partial" className="star filled">
          ★
        </span>
      );
    }

    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star">
          ☆
        </span>
      );
    }

    return stars;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#FFD700'; // Gold for high ratings
    if (rating >= 4.0) return '#FFA500'; // Orange for good ratings
    if (rating >= 3.5) return '#FF6B6B'; // Red for average ratings
    return '#CCCCCC'; // Gray for low ratings
  };

  const formatRating = (rating) => {
    // Remove trailing .0 if it's a whole number
    return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            Loved by Users Worldwide
          </h2>
          <p className="testimonials-subtitle">
            Discover why thousands trust HeartEcho for meaningful connections
          </p>
        </div>

        <div className="testimonials-carousel">
          <button 
            className="carousel-button prev-button"
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="testimonials-track">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`testimonial-card ${
                  index === currentTestimonial ? 'active' : ''
                } ${isAnimating ? 'animating' : ''}`}
              >
                <div className="testimonial-content">
                  {/* Rating Stars */}
                  <div className="testimonial-rating">
                    <div className="stars-container">
                      {renderStars(testimonial.rating)}
                    </div>
                    <span 
                      className="rating-text"
                      style={{ color: getRatingColor(testimonial.rating) }}
                    >
                      {formatRating(testimonial.rating)}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="testimonial-comment">
                    "{testimonial.comment}"
                  </div>

                  {/* User Info */}
                  <div className="testimonial-user">
                    <div className="user-avatar">
                      <Image 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className="avatar-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="avatar-fallback">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="user-info">
                      <div className="user-name">{testimonial.name}</div>
                      <div className="user-details">
                        {testimonial.role} • {testimonial.location}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="testimonial-date">
                    {testimonial.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="carousel-button next-button"
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentTestimonial ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;