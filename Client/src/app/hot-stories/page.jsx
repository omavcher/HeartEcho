// app/hot-stories/page.jsx
'use client';

import './hotStories.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '../../components/Footer';
import api from '../../config/api';

// Skeleton Loading Components
const SkeletonHero = () => (
  <section className="hero-section-djkei skeleton-container">
    <div className="hero-content-djkei">
      <div className="skeleton-text skeleton-title"></div>
      <div className="skeleton-text skeleton-subtitle"></div>
      <div className="skeleton-text skeleton-description"></div>
      <div className="skeleton-text skeleton-description"></div>
      <div className="hero-stats-djkei">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-item-djkei">
            <div className="skeleton-stat-number"></div>
            <div className="skeleton-stat-label"></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SkeletonCities = () => (
  <section className="cities-section-djkei skeleton-container">
    <div className="skeleton-text skeleton-section-title"></div>
    <div className="skeleton-text skeleton-description"></div>
    <div className="cities-grid-djkei">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="city-card-djkei">
          <div className="city-image-djkei skeleton-image"></div>
          <div className="city-stats-djkei">
            <div className="skeleton-text skeleton-small"></div>
            <div className="skeleton-text skeleton-small"></div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SkeletonFeatured = () => (
  <section className="skeleton-container">
    <div className="section-header-djkei">
      <div className="skeleton-text skeleton-section-title"></div>
      <div className="skeleton-text skeleton-link"></div>
    </div>
    <div className="featured-carousel-djkei">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="featured-card-djkei">
          <div className="featured-image-container-djkei skeleton-image"></div>
          <div className="featured-content-djkei">
            <div className="skeleton-text skeleton-tag"></div>
            <div className="skeleton-text skeleton-title-small"></div>
            <div className="skeleton-text skeleton-excerpt"></div>
            <div className="skeleton-text skeleton-excerpt"></div>
            <div className="story-meta-djkei">
              {[1, 2, 3].map((j) => (
                <div key={j} className="skeleton-text skeleton-meta"></div>
              ))}
            </div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SkeletonFilter = () => (
  <section className="filter-section-djkei skeleton-container">
    <div className="search-box-djkei">
      <div className="skeleton-search-input"></div>
      <div className="skeleton-search-button"></div>
    </div>
    <div className="filter-controls-djkei">
      {[1, 2].map((i) => (
        <div key={i} className="filter-group-djkei">
          <div className="skeleton-text skeleton-filter-label"></div>
          <div className="category-filters-djkei">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
              <div key={j} className="skeleton-filter-button"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SkeletonStoryCard = () => (
  <div className="story-card-djkei">
    <div className="card-header-djkei">
      <div className="story-image-container-djkei skeleton-image"></div>
      <div className="skeleton-category-badge"></div>
    </div>
    <div className="card-content-djkei">
      <div className="skeleton-text skeleton-title-small"></div>
      <div className="skeleton-text skeleton-excerpt"></div>
      <div className="character-info-djkei">
        <div className="character-avatar-container-djkei skeleton-avatar"></div>
        <div className="character-details-djkei">
          <div className="skeleton-text skeleton-name"></div>
          <div className="skeleton-text skeleton-age"></div>
        </div>
      </div>
      <div className="story-stats-djkei">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-item-small-djkei">
            <div className="skeleton-text skeleton-stat"></div>
          </div>
        ))}
      </div>
      <div className="card-actions-djkei">
        <div className="skeleton-button-small"></div>
        <div className="skeleton-button-small"></div>
      </div>
    </div>
  </div>
);

const SkeletonStoriesGrid = () => (
  <section className="stories-section-djkei skeleton-container">
    <div className="section-header-djkei">
      <div className="skeleton-text skeleton-section-title"></div>
      <div className="skeleton-sort-controls"></div>
    </div>
    <div className="stories-grid-djkei">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonStoryCard key={i} />
      ))}
    </div>
  </section>
);

export default function HotStoriesPage() {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all data from backend
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch stories
        const storiesResponse = await axios.get(`${api.Url}/story`);
        
        if (storiesResponse.data && storiesResponse.data.success) {
          setStories(storiesResponse.data.data || []);
          
          // Extract unique categories and cities from stories
          const storyCategories = ['All', ...new Set(storiesResponse.data.data
            .map(story => story.category)
            .filter(Boolean))];
          const storyCities = ['All Cities', ...new Set(storiesResponse.data.data
            .map(story => story.city)
            .filter(Boolean))];
          
          setCategories(storyCategories);
          setCities(storyCities);
        } else {
          setStories([]);
          setCategories(['All']);
          setCities(['All Cities']);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setStories([]);
        setCategories(['All']);
        setCities(['All Cities']);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Get unique cities for the cities section
  const uniqueCities = Array.from(new Set(stories.map(story => story.city)))
    .filter(Boolean)
    .slice(0, 6);

  // Get featured stories
  const featuredStories = stories.filter(story => story.featured).slice(0, 4);

  // Filter stories based on selected filters and search
  const filteredStories = stories.filter(story => {
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
    const matchesCity = selectedCity === 'All Cities' || story.city === selectedCity;
    const matchesSearch = searchQuery === '' || 
      story.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.characterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesCity && matchesSearch;
  });

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Full skeleton loading
  if (loading) {
    return (
      <>
        <main className="container-djkei">
          <SkeletonHero />
          <SkeletonCities />
          <SkeletonFeatured />
          <SkeletonFilter />
          <SkeletonStoriesGrid />
          {/* SEO Content Skeleton */}
          <section className="seo-content-djkei skeleton-container">
            <div className="skeleton-text skeleton-section-title"></div>
            <div className="seo-text-djkei">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-text skeleton-description"></div>
              ))}
            </div>
            <div className="seo-keywords-djkei">
              <div className="skeleton-text skeleton-subtitle"></div>
              <div className="keywords-list-djkei">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton-keyword-tag"></div>
                ))}
              </div>
            </div>
          </section>
          {/* CTA Skeleton */}
          <section className="cta-section-djkei skeleton-container">
            <div className="cta-content-djkei">
              <div className="skeleton-text skeleton-section-title"></div>
              <div className="skeleton-text skeleton-description"></div>
              <div className="cta-buttons-djkei">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <main className="container-djkei">
        <div className="error-container-djkei">
          <p className="error-text-djkei">{error}</p>
          <button 
            onClick={handleRetry}
            className="retry-button-djkei"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container-djkei">
       
        {/* Trending Cities Section */}
        {uniqueCities.length > 0 && (
          <section className="cities-section-djkei">
            <h2 className="section-title-djkei">
              <span className="title-icon-djkei">📍</span>
              Stories by City
            </h2>
            <p className="cities-description-djkei">
              Explore interactive stories from different Indian cities. Each city has unique characters and scenarios.
            </p>
            
            <div className="cities-grid-djkei">
              {uniqueCities.map(city => (
                <Link 
                  key={city}
                  href={`/city/${city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="city-card-djkei"
                >
                  <div className="city-image-djkei">
                    <div className="city-name-overlay-djkei">{city}</div>
                  </div>
                  <div className="city-stats-djkei">
                    <span className="city-story-count-djkei">
                      {stories.filter(s => s.city === city).length}+ Stories
                    </span>
                    <span className="city-arrow-djkei">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Stories Carousel
        <section>
          <div className="section-header-djkei">
            <h2 className="section-title-djkei">
              <span className="title-icon-djkei">🔥</span>
              Featured Stories
              <span className="title-badge-djkei">Most Popular</span>
            </h2>
            <Link href="/featured" className="view-all-link-djkei">
              View All Featured →
            </Link>
          </div>
          
          <div className="featured-carousel-djkei">
            {featuredStories.length > 0 ? (
              featuredStories.map(story => (
                <div key={story.id || story._id} className="featured-card-djkei">
                  <div className="featured-image-container-djkei">
                    <img 
                      src={story.backgroundImage || story.image || '/api/placeholder/600/337.5'} 
                      alt={story.title}
                      className="featured-image-djkei"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/600/337.5';
                      }}
                    />
                    <div className="city-badge-djkei">{story.city}</div>
                    {story.trending && (
                      <div className="trending-badge-djkei">
                        <span className="fire-icon-djkei">🔥</span>
                        Trending
                      </div>
                    )}
                  </div>
                  <div className="featured-content-djkei">
                    <div className="category-tag-djkei">{story.category}</div>
                    <h3 className="featured-title-djkei">{story.title}</h3>
                    <p className="featured-excerpt-djkei">{story.excerpt}</p>
                    <div className="story-meta-djkei">
                      <div className="meta-item-djkei">
                        <span className="meta-icon-djkei">👤</span>
                        {story.characterName}, {story.characterAge || story.age}
                      </div>
                      <div className="meta-item-djkei">
                        <span className="meta-icon-djkei">⭐</span>
                        {story.rating || '4.5'}
                      </div>
                      <div className="meta-item-djkei">
                        <span className="meta-icon-djkei">👁️</span>
                        {story.readCount || '1.2k'}
                      </div>
                    </div>
                    <Link 
                      href={`/hot-stories/${story.slug || story.id}`}
                      className="read-button-djkei"
                    >
                      Read & Chat →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message-djkei">
                No featured stories available
              </div>
            )}
          </div>
        </section> */}

        {/* Filter and Search Section */}
        <section className="filter-section-djkei">
          <div className="search-box-djkei">
            <input 
              type="text" 
              placeholder="Search stories, characters, or cities..."
              className="search-input-djkei"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button-djkei">
              <span className="search-icon-djkei">🔍</span>
            </button>
          </div>

          <div className="filter-controls-djkei">
            <div className="filter-group-djkei">
              <label className="filter-label-djkei">Filter by Category:</label>
              <div className="category-filters-djkei">
                {categories.slice(0, 8).map(category => (
                  <button 
                    key={category} 
                    className={`category-filter-djkei ${selectedCategory === category ? 'active-filter-djkei' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group-djkei">
              <label className="filter-label-djkei">Filter by City:</label>
              <div className="city-filters-djkei">
                {cities.slice(0, 6).map(city => (
                  <button 
                    key={city} 
                    className={`city-filter-djkei ${selectedCity === city ? 'active-filter-djkei' : ''}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* All Stories Grid */}
        <section className="stories-section-djkei">
          <div className="section-header-djkei">
            <h2 className="section-title-djkei">
              <span className="title-icon-djkei">📚</span>
              All Interactive Stories
              <span className="story-count-djkei">{filteredStories.length} stories</span>
            </h2>
            <div className="sort-controls-djkei">
              <select className="sort-select-djkei">
                <option>Sort by: Popularity</option>
                <option>Sort by: Rating</option>
                <option>Sort by: Newest</option>
                <option>Sort by: City</option>
              </select>
            </div>
          </div>

          {filteredStories.length > 0 ? (
            <div className="stories-grid-djkei">
              {filteredStories.map(story => (
                <div key={story.id || story._id} className="story-card-djkei">
                  <div className="card-header-djkei">
                    <div className="story-image-container-djkei">
                      <img 
                        src={story.backgroundImage || story.image || '/api/placeholder/600/337.5'} 
                        alt={`${story.city} - ${story.title}`}
                        className="story-background-image-djkei"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/600/337.5';
                        }}
                      />
                      <div className="image-overlay-djkei">
                        <div className="city-badge-small-djkei">{story.city}</div>
                        {story.trending && (
                          <div className="trending-indicator-djkei">🔥</div>
                        )}
                      </div>
                    </div>
                    <div className="category-badge-djkei">{story.category}</div>
                  </div>
                  
                  <div className="card-content-djkei">
                    <h3 className="story-title-djkei">{story.title}</h3>
                    <p className="story-excerpt-djkei">{story.excerpt}</p>
                    
                    <div className="character-info-djkei">
                      <div className="character-avatar-container-djkei">
                        <img 
                          src={story.characterAvatar || '/api/placeholder/400/711.11'}
                          alt={`${story.characterName}'s avatar`}
                          className="character-avatar-image-djkei"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="character-avatar-fallback-djkei" style={{ display: 'none' }}>
                          {story.characterName?.charAt(0) || 'A'}
                        </div>
                      </div>
                      <div className="character-details-djkei">
                        <div className="character-name-djkei">{story.characterName}</div>
                        <div className="character-age-djkei">{story.characterAge || story.age} years</div>
                      </div>
                    </div>
                    
                    <div className="story-stats-djkei">
                      <div className="stat-item-small-djkei">
                        <span className="stat-icon-djkei">⭐</span>
                        <span className="stat-value-djkei">{story.rating || '4.5'}</span>
                      </div>
                      <div className="stat-item-small-djkei">
                        <span className="stat-icon-djkei">👁️</span>
                        <span className="stat-value-djkei">{story.readCount || '1.2k'}</span>
                      </div>
                      <div className="stat-item-small-djkei">
                        <span className="stat-icon-djkei">💬</span>
                        <span className="stat-value-djkei">Interactive</span>
                      </div>
                    </div>
                    
                    <div className="card-actions-djkei">
                      <Link 
                        href={`/hot-stories/${story.slug || story.id}`}
                        className="read-story-button-djkei"
                      >
                        Read Story
                      </Link>
                      <button className="chat-button-djkei">
                        Chat Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-stories-message-djkei">
              <p>No stories found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCity('All Cities');
                  setSearchQuery('');
                }}
                className="clear-filters-button-djkei"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

 {/* Hero Section */}
 <section className="hero-section-djkei">
          <div className="hero-content-djkei">
            <h1 className="hero-title-djkei">
              Interactive Adult Stories
            </h1>
            <p className="hero-subtitle-djkei">
              Chat with characters and shape your own adventure
            </p>
            <p className="hero-description-djkei">
              Discover thousands of interactive stories across India. Read, chat, and explore 
              different endings based on your choices. Each story is unique to its city and character.
            </p>
            <div className="hero-stats-djkei">
              <div className="stat-item-djkei">
                <span className="stat-number-djkei">{stories.length}+</span>
                <span className="stat-label-djkei">Stories</span>
              </div>
              <div className="stat-item-djkei">
                <span className="stat-number-djkei">{uniqueCities.length}+</span>
                <span className="stat-label-djkei">Cities</span>
              </div>
              <div className="stat-item-djkei">
                <span className="stat-number-djkei">
                  {stories.length > 0 ? 
                    (stories.reduce((sum, story) => sum + (parseFloat(story.rating) || 0), 0) / stories.length).toFixed(1) : 
                    '0.0'
                  }
                </span>
                <span className="stat-label-djkei">Avg Rating</span>
              </div>
            </div>
          </div>
        </section>



        {/* SEO Content Section */}
        <section className="seo-content-djkei">
          <h2 className="seo-title-djkei">Interactive Adult Stories - Your Gateway to Personalized Entertainment</h2>
          <div className="seo-text-djkei">
            <p>
              Welcome to India's largest collection of interactive adult stories where you don't just read - you participate. 
              Our platform offers unique, city-specific narratives featuring characters from various backgrounds including 
              housewives, corporate professionals, students, and artists.
            </p>
            <p>
              Each story is set in authentic Indian locations like Mumbai, Delhi, Bangalore, Chennai, Kolkata, and more. 
              The interactive nature allows you to chat with characters and influence the storyline, creating a personalized 
              experience every time.
            </p>
            <p>
              Whether you're looking for romantic encounters, thrilling adventures, or emotional journeys, our stories 
              cater to diverse tastes. The platform combines traditional storytelling with modern interactive elements, 
              making each reading session unique and engaging.
            </p>
          </div>
          
          <div className="seo-keywords-djkei">
            <h3 className="keywords-title-djkei">Popular Search Terms:</h3>
            <div className="keywords-list-djkei">
              <span className="keyword-tag-djkei">interactive adult stories</span>
              <span className="keyword-tag-djkei">Indian romance stories</span>
              <span className="keyword-tag-djkei">chat with characters</span>
              <span className="keyword-tag-djkei">desi romantic stories</span>
              <span className="keyword-tag-djkei">adult interactive fiction</span>
              <span className="keyword-tag-djkei">city-based stories</span>
              <span className="keyword-tag-djkei">Hindi adult stories</span>
              <span className="keyword-tag-djkei">roleplay chat stories</span>
              <span className="keyword-tag-djkei">Bhabhi stories Mumbai</span>
              <span className="keyword-tag-djkei">corporate romance Delhi</span>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section-djkei">
          <div className="cta-content-djkei">
            <h2 className="cta-title-djkei">Ready to Start Your Interactive Journey?</h2>
            <p className="cta-description-djkei">
              Join thousands of readers who are already shaping their own stories. 
              No registration required - start reading and chatting instantly.
            </p>
            <div className="cta-buttons-djkei">
              <Link href="/get-started" className="cta-primary-djkei">
                Start Reading Free
              </Link>
              <Link href="/how-it-works" className="cta-secondary-djkei">
                How It Works
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer/>
    </>
  );
}