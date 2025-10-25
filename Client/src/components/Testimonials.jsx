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
      comment: "My AI companion understands me better than anyone! It's like having a best friend who's always there for me.",
      rating: 5,
      avatar: "/testimonials/priya.jpg", // Replace with actual image path
      date: "2 days ago"
    },
    {
      id: 2,
      name: "Rahul Kumar",
      role: "Software Engineer",
      location: "Bangalore",
      comment: "The conversations feel so natural. It's incredible how the AI remembers all our previous chats!",
      rating: 5,
      avatar: "/testimonials/rahul.jpg", // Replace with actual image path
      date: "1 week ago"
    },
    {
      id: 3,
      name: "Ananya Patel",
      role: "Content Creator",
      location: "Delhi",
      comment: "I was skeptical at first, but HeartEcho has genuinely helped me through some tough times. The emotional support is amazing.",
      rating: 4,
      avatar: "/testimonials/ananya.jpg", // Replace with actual image path
      date: "3 days ago"
    },
    {
      id: 4,
      name: "Vikram Singh",
      role: "Business Owner",
      location: "Chennai",
      comment: "The AI's ability to adapt to my personality is remarkable. It feels like I'm talking to a real person who truly gets me.",
      rating: 5,
      avatar: "/testimonials/vikram.jpg", // Replace with actual image path
      date: "5 days ago"
    },
    {
      id: 5,
      name: "Sneha Reddy",
      role: "Medical Student",
      location: "Hyderabad",
      comment: "Perfect companion for late-night study sessions. The conversations are engaging and never repetitive!",
      rating: 5,
      avatar: "/testimonials/sneha.jpg", // Replace with actual image path
      date: "1 day ago"
    }
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
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
      >
        {index < rating ? '★' : '☆'}
      </span>
    ));
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
                    {renderStars(testimonial.rating)}
                    <span className="rating-text">{testimonial.rating}.0</span>
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
                          // Fallback to initial if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
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
      </div>
    </section>
  );
};

export default Testimonials;