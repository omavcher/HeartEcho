// app/city/[cityName]/page.jsx
'use client';

import './cityPage.css';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Footer from '../../../components/Footer';
import api from '../../../config/api';
import { getCitySEO, getCityDetails, citiesList } from '../../../data/cities';
import { 
  Flame, 
  MapPin, 
  Sparkles, 
  Star, 
  Eye, 
  MessageSquare, 
  BookOpen, 
  Compass, 
  ChevronUp, 
  Lock, 
  Mic, 
  Bookmark,
  RotateCcw
} from 'lucide-react';

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
  const [isFallbackStories, setIsFallbackStories] = useState(false);
  
  const cityInfoRef = useRef(null);
  const storiesRef = useRef(null);

  // Fetch data for the city
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api.Url}/story`);
        
        if (response.data?.success) {
          const allStories = response.data.data || [];
          
          // Filter stories for this city
          let citySpecificStories = allStories.filter(story => 
            story.city?.toLowerCase() === cityName.toLowerCase()
          );
          
          let isFallback = false;
          if (citySpecificStories.length === 0) {
            isFallback = true;
            // Fallback to top popular stories from allStories
            citySpecificStories = [...allStories]
              .sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
              .slice(0, 12);
          }
          setIsFallbackStories(isFallback);
          
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
          
          // Original images lookup for backward compatibility
          const originalCityImages = {
            delhi: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/delhi_kzwnx9.webp",
            mumbai: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570918/mumbai_iul7vz.webp",
            bangalore: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/bangalore_uvjbmi.webp",
            hyderabad: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/hyderabad_l0k1jo.webp",
            chennai: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/chennai_e0ftkb.webp",
            kolkata: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570919/kolkata_vmxice.webp",
            pune: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/pune_q2kxso.webp",
            ahmedabad: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570914/ahmedabad_ksmdpo.webp",
            jaipur: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/jaipur_qxcfb7.webp",
            lucknow: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/lucknow_gcma1c.webp",
            goa: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/goa_rqir0f.webp",
            chandigarh: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/chandigarh_gcgqak.webp"
          };
          
          const cityKey = cityName.toLowerCase();
          const citySEO = getCitySEO(cityName);
          
          setCityData({
            title: citySEO.title,
            description: citySEO.description,
            lang: citySEO.lang,
            stateName: citySEO.stateName,
            formattedName: citySEO.formattedName,
            image: originalCityImages[cityKey] || ""
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
              backgroundImage: cityData?.image 
                ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('${cityData.image}')`
                : `linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(206, 64, 133, 0.3) 50%, rgba(108, 99, 255, 0.3) 100%)`
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
          <div className="section-header" style={{ marginBottom: '30px' }}>
            <h2 className="section-title">
              <span className="title-icon"><Flame size={24} fill="currentColor" /></span>
              {isFallbackStories 
                ? `Popular Desi AI Girlfriend Stories in India` 
                : `Intimate AI Girlfriend Stories in ${cityName}`}
            </h2>
            <p className="section-description">
              {isFallbackStories 
                ? `Meet our most popular virtual companions and play interactive romance stories.`
                : `Interactive stories and roleplays featuring AI companions from ${cityName}.`}
            </p>
          </div>
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
                              <MapPin size={12} className="city-icon" />
                              {story.city}
                            </div>
                            {story.trending && (
                              <div className="trending-badge">
                                <Flame size={12} fill="currentColor" />
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
                          <Bookmark size={16} className="bookmark-icon" />
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
                            <Star size={12} fill="currentColor" className="stat-icon" style={{ color: '#FFD700' }} />
                            <span className="stat-value">{rating}</span>
                          </div>
                          <div className="stat-item">
                            <Eye size={12} className="stat-icon" />
                            <span className="stat-value">{readCount.toLocaleString()}</span>
                          </div>
                          <div className="stat-item">
                            <MessageSquare size={12} className="stat-icon" />
                            <span className="stat-value">{chatCount.toLocaleString()} chats</span>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <Link 
                            href={`/hot-stories/${story.slug || story.id}`}
                            className="action-button read-button"
                          >
                            <BookOpen size={14} className="button-icon" />
                            Read Story
                          </Link>
                          <Link 
                            href={`/chatbox?chatId=${story.characterId || story.id}`}
                            className="action-button chat-button"
                          >
                            <MessageSquare size={14} className="button-icon" />
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
                  <BookOpen size={48} className="no-stories-icon" />
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
              <MapPin size={48} className="no-stories-icon" />
              <h3>No stories available for {cityName}</h3>
              <p>Check back soon or explore other cities</p>
              <Link href="/hot-stories" className="browse-cities-button">
                Browse All Cities
              </Link>
            </div>
          )}
        </section>

        {/* Localized SEO Rich Content Section */}
        <section className="city-info-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon"><Sparkles size={24} /></span>
              Why Choose HeartEcho AI Girlfriend in {cityName}?
            </h2>
            <p className="section-description">
              The premier virtual companion and private roleplay platform designed for Indian users.
            </p>
          </div>

          <div className="city-info-grid">
            <div className="info-card">
              <div className="info-card-header">
                <Sparkles size={20} className="info-icon" style={{ color: '#cf4185' }} />
                <h3>Intimate {cityData?.lang || 'Hindi'} Roleplay</h3>
              </div>
              <div className="info-card-content">
                <p>
                  Experience tailored virtual relationships with companions who understand your cultural context.
                  Chat in natural Hinglish, {cityData?.lang || 'Hindi'}, or English. Our AI characters are customized
                  with local traits, personalities, and backgrounds representing {cityName} and {cityData?.stateName || 'India'}.
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <Lock size={20} className="info-icon" style={{ color: '#cf4185' }} />
                <h3>100% Private & Secure Companion Roleplay</h3>
              </div>
              <div className="info-card-content">
                <p>
                  Your privacy is our absolute priority. Engage in private roleplay, sharing thoughts, dreams,
                  and secrets in a completely secure, encrypted environment. No logins required to start, and no logs
                  are ever shared. Experience safe AI companion chat with peace of mind.
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <Mic size={20} className="info-icon" style={{ color: '#cf4185' }} />
                <h3>Dynamic Memories & Voice Messages</h3>
              </div>
              <div className="info-card-content">
                <p>
                  Unlike generic chat bots, HeartEcho companions remember your previous conversations,
                  hobbies, and preferences to build deep emotional connections. Hear them talk with ultra-realistic
                  voice messages that bring your virtual girlfriend to life.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Cities */}
        <section className="related-cities">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon"><Compass size={24} /></span>
              Explore Other Cities
            </h2>
            <p className="section-description">
              Discover stories from different locations
            </p>
          </div>
          
          <div className="cities-carousel">
            {citiesList
              .filter(c => c.key !== cityName.toLowerCase())
              .slice(0, 4)
              .map(city => {
                const cityStoriesCount = stories.filter(s => 
                  s.city?.toLowerCase() === city.key || s.city?.toLowerCase() === city.name.toLowerCase()
                ).length;
                
                const originalCityImages = {
                  delhi: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/delhi_kzwnx9.webp",
                  mumbai: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570918/mumbai_iul7vz.webp",
                  bangalore: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/bangalore_uvjbmi.webp",
                  hyderabad: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/hyderabad_l0k1jo.webp",
                  chennai: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/chennai_e0ftkb.webp",
                  kolkata: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570919/kolkata_vmxice.webp",
                  pune: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/pune_q2kxso.webp",
                  ahmedabad: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570914/ahmedabad_ksmdpo.webp",
                  jaipur: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/jaipur_qxcfb7.webp",
                  lucknow: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/lucknow_gcma1c.webp",
                  goa: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/goa_rqir0f.webp",
                  chandigarh: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/chandigarh_gcgqak.webp"
                };
                
                const cityImg = originalCityImages[city.key] || "";
                
                return (
                  <Link 
                    key={city.key}
                    href={`/city/${city.key}`}
                    className="related-city-card"
                  >
                    <div className="city-thumbnail">
                      {cityImg ? (
                        <img 
                          className="city-thumbnail-img" 
                          src={cityImg} 
                          alt={city.name} 
                          loading="lazy"
                        />
                      ) : (
                        <div 
                          className="city-thumbnail-img-fallback"
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #111 0%, #ce4085 100%)',
                            opacity: 0.8
                          }}
                        />
                      )}
                      <div className="city-image-overlay"></div>
                    </div>
                    <div className="city-info">
                      <h4>{city.name}</h4>
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
              <Link href="/hot-stories" className="city-button primary">
                <Compass size={16} /> Explore All Cities
              </Link>
              <button onClick={scrollToTop} className="city-button secondary">
                <ChevronUp size={16} /> Back to Top
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="scroll-top-button">
          <ChevronUp size={20} />
        </button>
      )}

      <Footer />
    </>
  );
}