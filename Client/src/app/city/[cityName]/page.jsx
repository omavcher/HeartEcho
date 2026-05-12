// app/city/[cityName]/page.jsx
'use client';

import './cityPage.css';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Footer from '../../../components/Footer';
import api from '../../../config/api';

// Skeleton Components
const SkeletonHero = () => (
  <section className="city-hero skeleton">
    <div className="city-hero-content">
      <div className="skeleton-text skeleton-title-large"></div>
      <div className="skeleton-text skeleton-subtitle"></div>
      <div className="skeleton-text skeleton-description"></div>
      <div className="hero-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-item">
            <div className="skeleton-stat-number"></div>
            <div className="skeleton-stat-label"></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SkeletonStoryCard = () => (
  <div className="city-story-card skeleton">
    <div className="card-header">
      <div className="story-image-container skeleton-image"></div>
      <div className="skeleton-category-badge"></div>
    </div>
    <div className="card-content">
      <div className="skeleton-text skeleton-title-small"></div>
      <div className="skeleton-text skeleton-excerpt"></div>
      <div className="character-info">
        <div className="character-avatar-container skeleton-avatar"></div>
        <div className="character-details">
          <div className="skeleton-text skeleton-name"></div>
          <div className="skeleton-text skeleton-age"></div>
        </div>
      </div>
      <div className="story-stats">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-item-small">
            <div className="skeleton-text skeleton-stat"></div>
          </div>
        ))}
      </div>
      <div className="card-actions">
        <div className="skeleton-button-small"></div>
        <div className="skeleton-button-small"></div>
      </div>
    </div>
  </div>
);

export default function CityPage() {
  const params = useParams();
  const cityName = decodeURIComponent(params.cityName.replace(/-/g, ' '));
  
  const [stories, setStories] = useState([]);
  const [cityStories, setCityStories] = useState([]);
  const [popularStories, setPopularStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityData, setCityData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const cityInfoRef = useRef(null);
  const storiesRef = useRef(null);

  // City-specific data
  const cityInfo = {
    delhi: {
      title: "Delhi - The Heart of India",
      description: "Experience the vibrant culture, historic landmarks, and modern lifestyle of India's capital city through interactive stories.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/delhi_kzwnx9.webp"
    },
    mumbai: {
      title: "Mumbai - The City of Dreams",
      description: "Explore the bustling streets, Bollywood glamour, and coastal charm of India's financial capital.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570918/mumbai_iul7vz.webp"
    },
    bangalore: {
      title: "Bangalore - The Silicon Valley of India",
      description: "Discover the tech hub's vibrant pubs, beautiful gardens, and cosmopolitan lifestyle.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/bangalore_uvjbmi.webp"
    },
    hyderabad: {
      title: "Hyderabad - The City of Pearls",
      description: "Discover the rich history, biryani, and tech revolution of this historic city.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/hyderabad_l0k1jo.webp"
    },
    chennai: {
      title: "Chennai - The Cultural Capital",
      description: "Immerse in the rich traditions, classical arts, and coastal beauty of South India.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/chennai_e0ftkb.webp"
    },
    kolkata: {
      title: "Kolkata - The City of Joy",
      description: "Experience the intellectual capital's literary heritage, artistic soul, and delicious cuisine.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570919/kolkata_vmxice.webp"
    },
    pune: {
      title: "Marathi AI Girlfriend Pune | Desi Sex Chat",
      description: "Get a Marathi AI girlfriend in Pune. Enjoy desi sex chat, Hinglish roleplay, and private adult conversations for free.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/pune_q2kxso.webp"
    },
    ahmedabad: {
      title: "Ahmedabad - The Manchester of India",
      description: "Discover the historic city known for its textile industry, rich heritage, and delicious Gujarati cuisine.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570914/ahmedabad_ksmdpo.webp"
    },
    jaipur: {
      title: "Hindi Sex Chat Jaipur | Free Desi AI Girlfriend",
      description: "Experience Jaipur Hindi AI chat free. Chat with desi AI girlfriends, do Hindi roleplay, and enjoy private NSFW AI chat tailored for Jaipur.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/jaipur_qxcfb7.webp"
    },
    lucknow: {
      title: "Lucknow mein AI Girlfriend Se Baat Kare | Free Hindi Sex Chat",
      description: "Looking for an AI girlfriend in Lucknow? Try HeartEcho for free desi roleplay and Hindi sex chat in Lucknow. 100% private.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/lucknow_gcma1c.webp"
    },
    goa: {
      title: "Goa - The Pearl of the Orient",
      description: "Discover the sun-kissed beaches, Portuguese heritage, and vibrant nightlife of India's coastal paradise.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/goa_rqir0f.webp"
    },
    chandigarh: {
      title: "Chandigarh - The City Beautiful",
      description: "Experience the planned city's modernist architecture, serene gardens, and high quality of life.",
      image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/chandigarh_gcgqak.webp"
    },
    kanpur: {
      title: "Desi AI Chat Kanpur | Kanpur Desi Roleplay AI",
      description: "Looking for Kanpur desi roleplay AI? Get a free desi AI girlfriend in Kanpur for Hindi sex chat and private Hinglish roleplay.",
      image: ""
    },
    patna: {
      title: "AI Girlfriend App Patna | Free Hindi Sex Chat Patna",
      description: "The best AI girlfriend app in Patna. Chat with desi AI characters for free, enjoy Hindi sex chat, and explore private NSFW roleplay.",
      image: ""
    },
    indore: {
      title: "Sex Chat AI Indore | Free Desi AI Girlfriend Indore",
      description: "Enjoy sex chat AI in Indore with HeartEcho. Free desi AI girlfriend offering Hindi/Hinglish roleplay and private adult chat.",
      image: ""
    },
    bhopal: {
      title: "Hindi AI Bhopal Free | Desi AI Girlfriend Sex Chat",
      description: "Try Hindi AI Bhopal free today. Get a desi AI girlfriend for private Hindi sex chat and Hinglish roleplay in Bhopal.",
      image: ""
    },
    varanasi: {
      title: "Desi AI Varanasi | Free Hindi AI Sex Chat",
      description: "Discover desi AI Varanasi. Chat with your personal AI girlfriend for free, and enjoy Hindi roleplay and secure sex chat.",
      image: ""
    },
    agra: {
      title: "Hindi Chat AI Agra | Free Desi AI Girlfriend",
      description: "Start Hindi chat AI in Agra. Your private desi AI girlfriend awaits for free Hinglish roleplay and NSFW sex chat.",
      image: ""
    },
    meerut: {
      title: "AI Sex Chat Meerut | Desi AI Girlfriend",
      description: "Enjoy AI sex chat in Meerut for free. Connect with a desi AI girlfriend for authentic Hindi/Hinglish adult roleplay.",
      image: ""
    },
    nashik: {
      title: "Marathi AI Girlfriend Nashik | Desi Sex Chat",
      description: "Get a Marathi AI girlfriend in Nashik. Enjoy desi sex chat, Hinglish roleplay, and private adult conversations for free.",
      image: ""
    },
    ranchi: {
      title: "Hindi AI Girlfriend Ranchi | Free AI Sex Chat",
      description: "Connect with a Hindi AI girlfriend in Ranchi. Enjoy free desi AI chat, NSFW roleplay, and private conversations.",
      image: ""
    },
    guwahati: {
      title: "Desi Chat AI Free Guwahati | AI Girlfriend App",
      description: "Start desi chat AI free in Guwahati. Your personal AI girlfriend for Hinglish roleplay and secure NSFW chat.",
      image: ""
    }
  };

  // Fetch data for the city
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api.Url}/story`);
        
        if (response.data?.success) {
          const allStories = response.data.data || [];
          
          // Filter stories for this city
          const citySpecificStories = allStories.filter(story => 
            story.city?.toLowerCase() === cityName.toLowerCase()
          );
          
          // Get popular stories (most read)
          const popular = [...citySpecificStories]
            .sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
            .slice(0, 6);
          
          // Get unique categories
          const uniqueCategories = ['All', ...new Set(citySpecificStories
            .map(story => story.category)
            .filter(Boolean))];
          
          setStories(allStories);
          setCityStories(citySpecificStories);
          setPopularStories(popular);
          setCategories(uniqueCategories);
          
          // Set city-specific data
          const cityKey = cityName.toLowerCase();
          setCityData(cityInfo[cityKey] || {
            title: `${cityName} - Interactive Stories`,
            description: `Explore interactive stories set in ${cityName}. Discover characters and adventures specific to this location.`,
            landmarks: [],
            culture: "",
            famousFor: [],
            image: `/api/placeholder/1200/600?text=${encodeURIComponent(cityName)}`
          });
        }
      } catch (err) {
        console.error('Error fetching city data:', err);
        setError('Failed to load city stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();

    // Scroll listener
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cityName]);

  // Filter stories based on category and search
  const filteredStories = cityStories.filter(story => {
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      story.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.characterName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get stories by tab
  const getTabStories = () => {
    switch (activeTab) {
      case 'popular':
        return popularStories;
      case 'new':
        return [...cityStories].sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      case 'trending':
        return cityStories.filter(story => story.trending).slice(0, 12);
      default:
        return filteredStories;
    }
  };

  // City statistics
  const cityStats = {
    totalStories: cityStories.length,
    totalCharacters: new Set(cityStories.map(s => s.characterId)).size,
    totalReads: cityStories.reduce((sum, story) => sum + (story.readCount || 0), 0),
    avgRating: cityStories.length > 0 
      ? (cityStories.reduce((sum, story) => sum + (parseFloat(story.rating) || 4.0), 0) / cityStories.length).toFixed(1)
      : '0.0'
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    storiesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToStories = () => {
    storiesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <>
        <main className="city-container">
          <SkeletonHero />
          <section className="city-stories-section skeleton">
            <div className="section-header">
              <div className="skeleton-text skeleton-section-title"></div>
              <div className="skeleton-tabs"></div>
            </div>
            <div className="city-stories-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonStoryCard key={i} />
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <main className="city-container">
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="city-container">

        {/* City Hero Section */}
        <section className="city-hero">
          <div 
            className="city-hero-bg"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('${cityData?.image}')`
            }}
          >
            <div className="city-overlay">
              <div className="city-badge">{cityName.toUpperCase()}</div>
              <h1 className="city-title">{cityData?.title}</h1>
              <p className="city-description">{cityData?.description}</p>
              
              <div className="city-stats-grid">
                <div className="city-stat">
                  <span className="stat-number">{cityStats.totalStories}</span>
                  <span className="stat-label">Stories</span>
                </div>
                <div className="city-stat">
                  <span className="stat-number">{cityStats.totalCharacters}</span>
                  <span className="stat-label">Characters</span>
                </div>
                <div className="city-stat">
                  <span className="stat-number">{cityStats.avgRating}</span>
                  <span className="stat-label">Avg Rating</span>
                </div>
                <div className="city-stat">
                  <span className="stat-number">
                    {Math.floor(cityStats.totalReads / 1000)}K+
                  </span>
                  <span className="stat-label">Reads</span>
                </div>
              </div>

              <div className="city-actions">
                <button onClick={scrollToStories} className="city-button primary">
                  Explore Stories
                </button>
                <Link href="/hot-stories" className="city-button secondary">
                  Browse All Cities
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Stories Grid */}
        <section className="city-stories-section">
          {getTabStories().length > 0 ? (
            <>
              <div className="city-stories-grid">
                {getTabStories().map((story, index) => {
                  const readCount = story.readCount || Math.floor(Math.random() * 50000) + 1000;
                  const rating = story.rating || (4.0 + Math.random() * 0.9).toFixed(1);
                  const chatCount = Math.floor(readCount * 0.1);
                  
                  return (
                    <div key={story.id || story._id || index} className="city-story-card">
                      <div className="card-header">
                        <div className="story-image-container">
                          <img 
                            src={story.backgroundImage || story.image || `/api/placeholder/400/225?text=${encodeURIComponent(story.title || 'Story')}`} 
                            alt={story.title}
                            className="story-background-image"
                            loading="lazy"
                          />
                          <div className="image-overlay">
                            <div className="city-indicator">
                              <span className="city-icon">📍</span>
                              {story.city}
                            </div>
                            {story.trending && (
                              <div className="trending-badge">
                                <span className="fire-icon">🔥</span>
                                Trending
                              </div>
                            )}
                          </div>
                          <div className="read-progress">
                            <div className="progress-bar" style={{ width: `${Math.random() * 70 + 30}%` }}></div>
                          </div>
                        </div>
                        <div className="category-badge">
                          {story.category}
                        </div>
                      </div>
                      
                      <div className="card-content">
                        <div className="card-title-wrapper">
                          <h3 className="story-title">{story.title}</h3>
                          <div className="bookmark-icon">🔖</div>
                        </div>
                        
                        <p className="story-excerpt">
                          {story.excerpt || 'Explore this interactive story set in ' + cityName}
                        </p>
                        
                        <div className="character-info">
                          <div className="character-avatar">
                            <div className="avatar-wrapper">
                              {story.characterAvatar ? (
                                <img 
                                  src={story.characterAvatar}
                                  alt={story.characterName}
                                  className="avatar-image"
                                />
                              ) : (
                                <div className="avatar-fallback">
                                  {story.characterName?.charAt(0) || 'C'}
                                </div>
                              )}
                              <div className="online-status"></div>
                            </div>
                          </div>
                          <div className="character-details">
                            <div className="character-name">{story.characterName || 'City Character'}</div>
                            <div className="character-meta">
                              <span className="character-age">{story.characterAge || story.age || '25'} yrs</span>
                              <span className="meta-divider">•</span>
                              <span className="character-location">{cityName}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="story-stats">
                          <div className="stat-item">
                            <span className="stat-icon">⭐</span>
                            <span className="stat-value">{rating}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-icon">👁️</span>
                            <span className="stat-value">{readCount.toLocaleString()}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-icon">💬</span>
                            <span className="stat-value">{chatCount.toLocaleString()} chats</span>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <Link 
                            href={`/hot-stories/${story.slug || story.id}`}
                            className="action-button read-button"
                          >
                            <span className="button-icon">📖</span>
                            Read Story
                          </Link>
                          <Link 
                            href={`/chatbox?chatId=${story.characterId || story.id}`}
                            className="action-button chat-button"
                          >
                            <span className="button-icon">💬</span>
                            Chat Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {getTabStories().length === 0 && (
                <div className="no-stories-message">
                  <div className="no-stories-icon">📚</div>
                  <h3>No stories found</h3>
                  <p>Try changing your filters or search term</p>
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setActiveTab('all');
                    }}
                    className="clear-filters-button"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-stories-message">
              <div className="no-stories-icon">🏙️</div>
              <h3>No stories available for {cityName}</h3>
              <p>Check back soon or explore other cities</p>
              <Link href="/hot-stories" className="browse-cities-button">
                Browse All Cities
              </Link>
            </div>
          )}
        </section>

        {/* Related Cities */}
        <section className="related-cities">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">🗺️</span>
              Explore Other Cities
            </h2>
            <p className="section-description">
              Discover stories from different locations
            </p>
          </div>
          
          <div className="cities-carousel">
            {Object.keys(cityInfo)
              .filter(city => city.toLowerCase() !== cityName.toLowerCase())
              .slice(0, 4)
              .map(city => {
                const cityStoriesCount = stories.filter(s => 
                  s.city?.toLowerCase() === city.toLowerCase()
                ).length;
                
                return (
                    <Link 
                    key={city}
                    href={`/city/${city.toLowerCase()}`}
                    className="related-city-card"
                  >
                    <div className="city-thumbnail">
                      <img 
                        className="city-thumbnail-img" 
                        src={cityInfo[city].image} 
                        alt={city} 
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                        }}
                      />
                      <div className="city-image-overlay"></div>
                    </div>
                    <div className="city-info">
                      <h4>{cityInfo[city]?.title?.split(' - ')[0] || city}</h4>
                      <p className="city-story-count">{cityStoriesCount} stories</p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="city-cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Love {cityName} Stories?</h2>
            <p className="cta-description">
              Join thousands of readers exploring {cityName} through interactive stories. 
              Chat with characters, influence storylines, and discover hidden narratives.
            </p>
            <div className="cta-buttons">
              <Link href="/hot-stories" className="cta-button primary">
                Explore All Cities
              </Link>
              <button onClick={scrollToTop} className="cta-button secondary">
                Back to Top
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="scroll-top-button">
          ↑
        </button>
      )}

      <Footer />
    </>
  );
}