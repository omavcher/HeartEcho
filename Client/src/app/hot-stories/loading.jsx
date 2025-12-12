// app/hot-stories/loading.jsx
export default function Loading() {
    return (
      <main className="container">
        <SkeletonHero />
        <section className="stories-section skeleton">
          <div className="section-header">
            <div className="skeleton-text skeleton-section-title"></div>
          </div>
          <div className="stories-grid">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonStoryCard key={i} />
            ))}
          </div>
        </section>
        <SkeletonCityGrid />
      </main>
    );
  }
  
  function SkeletonHero() {
    return (
      <section className="hero-section skeleton">
        <div className="hero-content">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-description"></div>
          <div className="skeleton-text skeleton-description"></div>
        </div>
      </section>
    );
  }
  
  function SkeletonStoryCard() {
    return (
      <div className="story-card skeleton">
        <div className="card-header">
          <div className="story-image-container skeleton-image"></div>
        </div>
        <div className="card-content">
          <div className="skeleton-text skeleton-title-small"></div>
          <div className="skeleton-text skeleton-excerpt"></div>
          <div className="character-info">
            <div className="skeleton-avatar"></div>
            <div className="character-details">
              <div className="skeleton-text skeleton-name"></div>
              <div className="skeleton-text skeleton-age"></div>
            </div>
          </div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    );
  }
  
  function SkeletonCityGrid() {
    return (
      <section className="all-cities-section skeleton">
        <div className="section-header">
          <div className="skeleton-text skeleton-section-title"></div>
          <div className="skeleton-text skeleton-description"></div>
        </div>
        <div className="all-cities-grid">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="all-city-card">
              <div className="all-city-image skeleton-image"></div>
              <div className="all-city-info">
                <div className="skeleton-text skeleton-city-name"></div>
                <div className="skeleton-text skeleton-city-stories"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }