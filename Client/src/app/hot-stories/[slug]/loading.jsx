// app/hot-stories/[slug]/loading.jsx
export default function Loading() {
    return (
      <div className="container-cwdw4x">
        <div className="header-controls-cwdw4x skeleton-container">
          <div className="skeleton-button-large-cwdw4x"></div>
          <div className="skeleton-lang-toggle-cwdw4x">
            <div className="skeleton-lang-button-cwdw4x"></div>
            <div className="skeleton-lang-button-cwdw4x"></div>
          </div>
        </div>
        
        <div className="skeleton-hero-cwdw4x">
          <div className="skeleton-background-cwdw4x"></div>
          <div className="skeleton-content-cwdw4x">
            <div className="skeleton-title-cwdw4x"></div>
            <div className="skeleton-stats-cwdw4x">
              <div className="skeleton-avatar-cwdw4x"></div>
              <div className="skeleton-stat-item-cwdw4x"></div>
              <div className="skeleton-stat-item-cwdw4x"></div>
              <div className="skeleton-stat-item-cwdw4x"></div>
              <div className="skeleton-stat-item-cwdw4x"></div>
            </div>
          </div>
        </div>
        
        <div className="skeleton-section-cwdw4x">
          <div className="skeleton-heading-cwdw4x"></div>
          <div className="skeleton-text-cwdw4x"></div>
          <div className="skeleton-text-cwdw4x"></div>
          <div className="skeleton-text-cwdw4x"></div>
          <div className="skeleton-text-cwdw4x"></div>
        </div>
        
        <div className="skeleton-chat-cwdw4x">
          <div className="skeleton-chat-header-cwdw4x"></div>
          <div className="skeleton-message-cwdw4x"></div>
          <div className="skeleton-button-cwdw4x"></div>
        </div>
        
        <div className="skeleton-related-cwdw4x">
          <div className="skeleton-heading-cwdw4x"></div>
          <div className="skeleton-grid-cwdw4x">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card-cwdw4x">
                <div className="skeleton-card-image-cwdw4x"></div>
                <div className="skeleton-card-title-cwdw4x"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="skeleton-tags-cwdw4x">
          <div className="skeleton-tag-cwdw4x"></div>
          <div className="skeleton-tag-cwdw4x"></div>
          <div className="skeleton-tag-cwdw4x"></div>
        </div>
      </div>
    );
  }