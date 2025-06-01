import React, { useState, useEffect } from 'react';
import { getPortfolio } from '../utils/api';
import styles from '../styles/Portfolio.module.css';

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const response = await getPortfolio();
        
        if (response.success) {
          setPortfolios(response.data.data || response.data || []);
        } else {
          setError(response.error || 'Failed to load portfolio');
        }
      } catch (err) {
        setError('Failed to load portfolio');
        console.error('Portfolio fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  // Get unique categories
  const categories = ['all', ...new Set(portfolios.map(item => item.category))];

  // Filter portfolios by category
  const filteredPortfolios = selectedCategory === 'all' 
    ? portfolios 
    : portfolios.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <section className={styles.portfolio} id="portfolio">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Portfolio</h2>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading our amazing projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.portfolio} id="portfolio">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Portfolio</h2>
          <div className={styles.error}>
            <p>Unable to load portfolio at the moment.</p>
            <button 
              onClick={() => window.location.reload()} 
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.portfolio} id="portfolio">
      <div className={styles.container}>
        <div className={styles.portfolioHeader}>
          <h2 className={styles.sectionTitle}>Our Portfolio</h2>
          <p className={styles.sectionSubtitle}>
            Discover the transformative power of AI through our successful projects
          </p>
        </div>

        {/* Category Filter */}
        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category}
              className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className={styles.portfolioGrid}>
          {filteredPortfolios.map((project, index) => (
            <div key={index} className={`${styles.portfolioCard} portfolio-card`}>
              <div className={styles.cardImage}>
                <img 
                  src={project.imageUrl || 'https://via.placeholder.com/600x400?text=Project+Image'} 
                  alt={project.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Project+Image';
                  }}
                />
                <div className={styles.cardOverlay}>
                  <div className={styles.categoryTag}>
                    {project.category}
                  </div>
                </div>
              </div>
              
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{project.title}</h3>
                <p className={styles.cardDescription}>{project.description}</p>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className={styles.technologies}>
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className={styles.cardFooter}>
                  <div className={styles.results}>
                    <span className={styles.resultsLabel}>Results:</span>
                    <span className={styles.resultsValue}>{project.results}</span>
                  </div>
                  
                  {project.clientName && (
                    <div className={styles.client}>
                      <span className={styles.clientLabel}>Client:</span>
                      <span className={styles.clientName}>{project.clientName}</span>
                    </div>
                  )}
                  
                  {project.projectUrl && (
                    <a 
                      href={project.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.projectLink}
                    >
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPortfolios.length === 0 && (
          <div className={styles.noResults}>
            <p>No projects found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
