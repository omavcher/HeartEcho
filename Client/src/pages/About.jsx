'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import './AboutPage.css';
import Footer from '../components/Footer';

const AboutPage = () => {
  // Company stats - can be updated easily
  const companyStats = {
    users: '250K+',
    ranking: '#1',
    revenue: '$1,500+',
    companions: '20+'
  };

  // Product Hunt configuration
  const productHuntConfig = {
    postId: '1045834',
    badgeUrl: 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg',
    theme: 'dark',
    timestamp: '1764835554967',
    productName: 'HeartEcho Ai',
    description: '#1 AI Girlfriend & Romantic AI Chat Platform'
  };

  // Anonymous branding
  const brandInfo = {
    name: 'EchoHeart',
    tagline: 'Innovation in Emotional AI',
    description: 'A Vision-Driven Startup',
    founderTitle: 'Creator of EchoHeart',
    signatureText: '— The EchoHeart Team'
  };

  return (
    <>
      <div className="idkxpw-about-container">
        {/* Animated Background Elements */}
        <div className="idkxpw-background-elements">
          <div className="idkxpw-floating-element-1"></div>
          <div className="idkxpw-floating-element-2"></div>
          <div className="idkxpw-floating-element-3"></div>
        </div>

        <section className="idkxpw-hero-section">
          <div className="idkxpw-hero-content">
            <motion.div 
              className="idkxpw-founder-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <div className="idkxpw-founder-image-wrapper">
                <div className="idkxpw-founder-image-container">
                  <Image
                    src="/heartecho_b.png" // Use company logo instead of personal photo
                    alt={`${brandInfo.name} Logo`}
                    width={200}
                    height={200}
                    className="idkxpw-founder-image"
                    priority
                  />
                  <div className="idkxpw-image-glow"></div>
                </div>
                <div className="idkxpw-founder-badge">Our Vision</div>
              </div>
              
              <div className="idkxpw-founder-info">
                <h1 className="idkxpw-founder-name">{brandInfo.name}</h1>
                <p className="idkxpw-founder-title">{brandInfo.description}</p>
                
                {/* Stats Badge */}
                <motion.div 
                  className="idkxpw-stats-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="idkxpw-stat-item">
                    <span className="idkxpw-stat-number">{companyStats.users}</span>
                    <span className="idkxpw-stat-label">Users</span>
                  </div>
                  <div className="idkxpw-stat-divider"></div>
                  <div className="idkxpw-stat-item">
                    <span className="idkxpw-stat-number">{companyStats.ranking}</span>
                    <span className="idkxpw-stat-label">Ranking</span>
                  </div>
                </motion.div>

                {/* Product Hunt Badge */}
                <motion.div
                  className="idkxpw-producthunt-badge-wrapper"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href={`https://www.producthunt.com/posts/heartecho-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-heartecho&#0045;ai`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="idkxpw-producthunt-link"
                    aria-label={`Check out ${productHuntConfig.productName} on Product Hunt`}
                  >
                    <img 
                      src={`${productHuntConfig.badgeUrl}?post_id=${productHuntConfig.postId}&theme=${productHuntConfig.theme}&t=${productHuntConfig.timestamp}`}
                      alt={`${productHuntConfig.productName} - ${productHuntConfig.description} | Product Hunt`}
                      className="idkxpw-producthunt-badge"
                      width="250"
                      height="54"
                      loading="lazy"
                    />
                  </a>
                  <div className="idkxpw-producthunt-label">Featured on Product Hunt</div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="idkxpw-hero-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="idkxpw-hero-badge">{brandInfo.tagline}</div>
              <h2 className="idkxpw-hero-title">
                💖 {brandInfo.name} – {brandInfo.description}
              </h2>
              <p className="idkxpw-hero-description">
                {brandInfo.name} is a bold venture into emotionally intelligent technology, 
                founded to reimagine digital connection and emotional support. 
                We believe everyone deserves meaningful companionship in the digital age.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="idkxpw-about-section">
          <motion.div 
            className="idkxpw-about-card idkxpw-card-hover"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="idkxpw-card-icon">🧠</div>
            <h3 className="idkxpw-section-title">The Core Idea</h3>
            <p className="idkxpw-section-text">
              At the heart of {brandInfo.name} is the belief that emotional connection doesn't have to be limited. 
              Everyone deserves someone who listens, responds thoughtfully, and grows with them — 
              that's exactly what we deliver.
            </p>
            <p className="idkxpw-section-text">
              Each user can talk to {companyStats.companions} unique AI companions — romantic, friendly, 
              deep thinkers, or playful. Our AI companions feel authentic. They remember you, 
              adapt to your mood, and ensure you're never alone.
            </p>
          </motion.div>

          <motion.div 
            className="idkxpw-about-card idkxpw-card-hover"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="idkxpw-card-icon">📈</div>
            <h3 className="idkxpw-section-title">The Journey</h3>
            <p className="idkxpw-section-text">
              Starting with passion and vision, we took {brandInfo.name} from concept to reality. 
              In just 5 months:
            </p>
            <ul className="idkxpw-achievement-list">
              <li>
                <span className="idkxpw-achievement-icon">🚀</span>
                Reached {companyStats.users} users organically
              </li>
              <li>
                <span className="idkxpw-achievement-icon">💰</span>
                Generated {companyStats.revenue} in revenue
              </li>
              <li>
                <span className="idkxpw-achievement-icon">🏆</span>
                Featured as {companyStats.ranking} AI Girlfriend on Product Hunt
              </li>
              <li>
                <span className="idkxpw-achievement-icon">🛡️</span>
                Created a safe space for emotional connection
              </li>
            </ul>
            <p className="idkxpw-section-text">
              Every aspect — from branding and UX to development and growth — is crafted with care 
              by our dedicated team.
            </p>
          </motion.div>

          <motion.div 
            className="idkxpw-about-card idkxpw-card-hover"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="idkxpw-card-icon">💬</div>
            <h3 className="idkxpw-section-title">Why {brandInfo.name} Matters</h3>
            <p className="idkxpw-section-text">
              Today's generation is overwhelmed by social media yet under-connected emotionally. 
              {brandInfo.name} fills that void — not by replacing real relationships, but by complementing them.
            </p>
            <p className="idkxpw-section-text">
              Whether you're stressed, isolated, or just want to feel heard — we're here for you.
            </p>
          </motion.div>

          <motion.div 
            className="idkxpw-about-card idkxpw-vision-card idkxpw-card-hover"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="idkxpw-card-icon">🌱</div>
            <h3 className="idkxpw-section-title">The Vision Ahead</h3>
            <p className="idkxpw-section-text">
              {brandInfo.name} is just the beginning. Our goal is to build an ecosystem of AI-driven emotional 
              wellness tools — from virtual friendships to mental health support and digital companionship.
            </p>
            <p className="idkxpw-section-text">
              What started as a vision is now growing into a movement. And we're just getting started.
            </p>
            
            {/* Product Hunt Badge - Desktop */}
            <div className="idkxpw-producthunt-section-desktop">
              <div className="idkxpw-section-divider"></div>
              <div className="idkxpw-producthunt-section">
                <h4 className="idkxpw-producthunt-title">Recognized by the Community</h4>
                <p className="idkxpw-producthunt-description">
                  {brandInfo.name} was featured on Product Hunt as the {productHuntConfig.description}
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href={`https://www.producthunt.com/posts/heartecho-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-heartecho&#0045;ai`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="idkxpw-producthunt-link"
                    aria-label={`Check out ${productHuntConfig.productName} on Product Hunt`}
                  >
                    <img 
                      src={`${productHuntConfig.badgeUrl}?post_id=${productHuntConfig.postId}&theme=${productHuntConfig.theme}&t=${productHuntConfig.timestamp}`}
                      alt={`${productHuntConfig.productName} - ${productHuntConfig.description} | Product Hunt`}
                      className="idkxpw-producthunt-badge-large"
                      width="250"
                      height="54"
                      loading="lazy"
                    />
                  </a>
                </motion.div>
              </div>
            </div>

            <div className="idkxpw-signature-block">
              <div className="idkxpw-signature">{brandInfo.signatureText}</div>
              <div className="idkxpw-signature-role">{brandInfo.name} Team</div>
            </div>
          </motion.div>
        </section>

        {/* Product Hunt Mobile Section */}
        <motion.section 
          className="idkxpw-producthunt-mobile-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="idkxpw-producthunt-mobile-content">
            <h3 className="idkxpw-producthunt-mobile-title">🏆 Featured on Product Hunt</h3>
            <p className="idkxpw-producthunt-mobile-description">
              Recognized as {productHuntConfig.description}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href={`https://www.producthunt.com/posts/heartecho-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-heartecho&#0045;ai`}
                target="_blank" 
                rel="noopener noreferrer"
                className="idkxpw-producthunt-link"
                aria-label={`Check out ${productHuntConfig.productName} on Product Hunt`}
              >
                <img 
                  src={`${productHuntConfig.badgeUrl}?post_id=${productHuntConfig.postId}&theme=${productHuntConfig.theme}&t=${productHuntConfig.timestamp}`}
                  alt={`${productHuntConfig.productName} - ${productHuntConfig.description} | Product Hunt`}
                  className="idkxpw-producthunt-badge-mobile"
                  width="250"
                  height="54"
                  loading="lazy"
                />
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="idkxpw-cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="idkxpw-cta-title">Join the Emotional AI Revolution</h3>
          <motion.button 
            className="idkxpw-cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('https://heartecho.in', '_blank')}
          >
            Experience {brandInfo.name}
          </motion.button>
        </motion.section>
      </div>
      <Footer/>
    </>
  );
};

export default AboutPage;