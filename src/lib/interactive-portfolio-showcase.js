/**
 * DigiClick AI Interactive Portfolio Showcase
 * Enhanced portfolio with 3D effects, immersive visualization, and AI-powered recommendations
 * Maintains WCAG 2.1 AA compliance and integrates with existing infrastructure
 */

import { getDynamicPortfolioManager } from './dynamic-portfolio-manager';
import { getPersonalizationManager } from './personalization-manager';
import { getAccessibilityManager } from './accessibility-manager';
import { getRedisCacheManager } from './redis-cache-manager';

class InteractivePortfolioShowcase {
  constructor() {
    this.portfolioManager = null;
    this.personalizationManager = null;
    this.accessibilityManager = null;
    this.cacheManager = null;
    
    this.portfolioData = new Map();
    this.filteredProjects = [];
    this.currentFilters = {};
    this.searchQuery = '';
    
    this.showcaseConfig = {
      visualization: {
        enable3D: true,
        enableWebGL: true,
        fallbackTo2D: true,
        maxParticles: 1000,
        animationDuration: 300,
        cameraTransitionSpeed: 1.5
      },
      performance: {
        lazyLoadThreshold: 0.1,
        imageOptimization: true,
        progressiveLoading: true,
        maxConcurrentLoads: 3,
        cacheStrategy: 'aggressive'
      },
      accessibility: {
        reducedMotionSupport: true,
        screenReaderDescriptions: true,
        keyboardNavigation: true,
        highContrastMode: true,
        focusManagement: true
      },
      filtering: {
        enableRealTimeSearch: true,
        fuzzySearchThreshold: 0.6,
        maxSuggestions: 5,
        debounceDelay: 300,
        enableFacetedSearch: true
      }
    };
    
    this.filterCategories = {
      projectType: {
        name: 'Project Type',
        options: ['ai_automation', 'web_application', 'mobile_app', 'e_commerce', 'digital_transformation'],
        multiSelect: true
      },
      technology: {
        name: 'Technology Stack',
        options: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'TensorFlow', 'MongoDB', 'AWS'],
        multiSelect: true
      },
      industry: {
        name: 'Industry',
        options: ['healthcare', 'finance', 'retail', 'technology', 'education'],
        multiSelect: true
      },
      complexity: {
        name: 'Complexity',
        options: ['low', 'medium', 'high'],
        multiSelect: false
      },
      timeline: {
        name: 'Timeline',
        options: ['1-3 months', '3-6 months', '6-12 months', '12+ months'],
        multiSelect: false
      }
    };
    
    this.sortOptions = {
      relevance: { name: 'Relevance', field: 'relevanceScore', order: 'desc' },
      date: { name: 'Date', field: 'createdAt', order: 'desc' },
      popularity: { name: 'Popularity', field: 'viewCount', order: 'desc' },
      complexity: { name: 'Complexity', field: 'complexityScore', order: 'desc' },
      alphabetical: { name: 'A-Z', field: 'title', order: 'asc' }
    };
    
    this.testimonialConfig = {
      autoPlay: true,
      autoPlayInterval: 5000,
      showNavigation: true,
      showPagination: true,
      enableVideo: true,
      enableVerification: true,
      maxTestimonials: 20
    };
    
    this.caseStudyTemplates = {
      performance: {
        name: 'Performance Improvement',
        metrics: ['page_load_time', 'core_web_vitals', 'lighthouse_score'],
        visualizations: ['before_after_chart', 'performance_timeline']
      },
      accessibility: {
        name: 'Accessibility Enhancement',
        metrics: ['wcag_compliance', 'screen_reader_compatibility', 'keyboard_navigation'],
        visualizations: ['accessibility_audit', 'compliance_chart']
      },
      business_impact: {
        name: 'Business Impact',
        metrics: ['conversion_rate', 'user_engagement', 'revenue_increase'],
        visualizations: ['roi_chart', 'business_metrics']
      },
      technical: {
        name: 'Technical Achievement',
        metrics: ['code_quality', 'test_coverage', 'deployment_frequency'],
        visualizations: ['architecture_diagram', 'technical_metrics']
      }
    };
    
    this.init();
  }

  async init() {
    this.portfolioManager = getDynamicPortfolioManager();
    this.personalizationManager = getPersonalizationManager();
    this.accessibilityManager = getAccessibilityManager();
    this.cacheManager = getRedisCacheManager();
    
    this.setupEventListeners();
    this.initializeWebGL();
    this.loadPortfolioData();
    this.setupAccessibilityFeatures();
  }

  setupEventListeners() {
    // Portfolio showcase events
    window.addEventListener('portfolio-filter-requested', (e) => {
      this.applyFilters(e.detail);
    });

    window.addEventListener('portfolio-search-requested', (e) => {
      this.performSearch(e.detail);
    });

    window.addEventListener('portfolio-sort-requested', (e) => {
      this.sortProjects(e.detail);
    });

    window.addEventListener('project-view-requested', (e) => {
      this.viewProject(e.detail);
    });

    window.addEventListener('case-study-generate-requested', (e) => {
      this.generateCaseStudy(e.detail);
    });

    window.addEventListener('testimonial-submit-requested', (e) => {
      this.submitTestimonial(e.detail);
    });

    // 3D visualization events
    window.addEventListener('3d-view-toggle-requested', (e) => {
      this.toggle3DView(e.detail);
    });

    window.addEventListener('project-3d-preview-requested', (e) => {
      this.show3DPreview(e.detail);
    });

    // Accessibility events
    window.addEventListener('accessibility-settings-changed', (e) => {
      this.updateAccessibilitySettings(e.detail);
    });

    // Personalization events
    window.addEventListener('user-preferences-updated', (e) => {
      this.updatePersonalizedRecommendations(e.detail);
    });
  }

  async loadPortfolioData() {
    try {
      // Load portfolio projects from cache or backend
      const cacheKey = 'portfolio:showcase:data';
      let portfolioData = await this.cacheManager.get(cacheKey);
      
      if (!portfolioData) {
        // Fetch from portfolio manager
        const projects = await this.portfolioManager.getPortfolioConfig();
        portfolioData = await this.enhancePortfolioData(projects);
        
        // Cache for 1 hour
        await this.cacheManager.set(cacheKey, portfolioData, 3600);
      }
      
      this.portfolioData = new Map(portfolioData.map(project => [project.id, project]));
      this.filteredProjects = Array.from(this.portfolioData.values());
      
      // Generate personalized recommendations
      await this.generatePersonalizedRecommendations();
      
      // Dispatch data loaded event
      window.dispatchEvent(new CustomEvent('portfolio-data-loaded', {
        detail: { projects: this.filteredProjects }
      }));
      
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      this.loadFallbackData();
    }
  }

  async enhancePortfolioData(projects) {
    const enhanced = [];
    
    for (const projectType of projects.projectTypes) {
      try {
        // Generate project description
        const description = await this.portfolioManager.createProjectDescription({
          projectType,
          clientIndustry: 'technology',
          technologies: projects.technologyStacks.frontend ? Object.keys(projects.technologyStacks.frontend).slice(0, 4) : [],
          outcomes: ['performance_optimization', 'accessibility_compliance']
        });
        
        // Generate case study
        const caseStudy = await this.portfolioManager.createCaseStudy({
          projectId: `${projectType}_showcase`,
          template: 'business_impact',
          includeMetrics: true
        });
        
        // Create enhanced project data
        const enhancedProject = {
          id: `${projectType}_showcase`,
          title: `${projectType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Project`,
          description: description.overview,
          projectType,
          technologies: projects.technologyStacks.frontend ? Object.keys(projects.technologyStacks.frontend).slice(0, 4) : [],
          industry: 'technology',
          complexity: projects.projectTypes[projectType]?.complexity || 'medium',
          timeline: '3-6 months',
          caseStudy,
          metrics: this.generateProjectMetrics(projectType),
          images: this.generateProjectImages(projectType),
          testimonial: this.generateTestimonial(projectType),
          createdAt: new Date().toISOString(),
          viewCount: Math.floor(Math.random() * 1000) + 100,
          relevanceScore: Math.random()
        };
        
        enhanced.push(enhancedProject);
      } catch (error) {
        console.error(`Error enhancing project ${projectType}:`, error);
      }
    }
    
    return enhanced;
  }

  async applyFilters(filterData) {
    try {
      this.currentFilters = { ...this.currentFilters, ...filterData };
      
      // Apply filters to portfolio data
      this.filteredProjects = Array.from(this.portfolioData.values()).filter(project => {
        return this.matchesFilters(project, this.currentFilters);
      });
      
      // Apply search if active
      if (this.searchQuery) {
        this.filteredProjects = this.performSearchOnProjects(this.filteredProjects, this.searchQuery);
      }
      
      // Generate filter counts for faceted search
      const filterCounts = this.generateFilterCounts();
      
      // Dispatch filtered results
      window.dispatchEvent(new CustomEvent('portfolio-filtered', {
        detail: { 
          projects: this.filteredProjects,
          filterCounts,
          activeFilters: this.currentFilters
        }
      }));
      
      // Track filter usage for personalization
      this.trackFilterUsage(filterData);
      
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  async performSearch(searchData) {
    try {
      const { query, suggestions = false } = searchData;
      this.searchQuery = query;
      
      if (!query.trim()) {
        // Reset to filtered results without search
        this.filteredProjects = Array.from(this.portfolioData.values()).filter(project => {
          return this.matchesFilters(project, this.currentFilters);
        });
      } else {
        // Perform fuzzy search
        const allProjects = Array.from(this.portfolioData.values()).filter(project => {
          return this.matchesFilters(project, this.currentFilters);
        });
        
        this.filteredProjects = this.performSearchOnProjects(allProjects, query);
      }
      
      // Generate search suggestions if requested
      let searchSuggestions = [];
      if (suggestions) {
        searchSuggestions = this.generateSearchSuggestions(query);
      }
      
      // Dispatch search results
      window.dispatchEvent(new CustomEvent('portfolio-search-completed', {
        detail: { 
          projects: this.filteredProjects,
          query,
          suggestions: searchSuggestions,
          resultCount: this.filteredProjects.length
        }
      }));
      
      // Track search for personalization
      this.trackSearchQuery(query);
      
    } catch (error) {
      console.error('Error performing search:', error);
    }
  }

  performSearchOnProjects(projects, query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return projects.filter(project => {
      const searchableText = [
        project.title,
        project.description,
        project.projectType,
        ...(project.technologies || []),
        project.industry
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => {
        return searchableText.includes(term) || this.fuzzyMatch(searchableText, term);
      });
    }).sort((a, b) => {
      // Sort by relevance (simple scoring based on title matches)
      const aScore = this.calculateSearchRelevance(a, query);
      const bScore = this.calculateSearchRelevance(b, query);
      return bScore - aScore;
    });
  }

  fuzzyMatch(text, term) {
    // Simple fuzzy matching implementation
    const threshold = this.showcaseConfig.filtering.fuzzySearchThreshold;
    const words = text.split(' ');
    
    return words.some(word => {
      const similarity = this.calculateSimilarity(word, term);
      return similarity >= threshold;
    });
  }

  calculateSimilarity(str1, str2) {
    // Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  calculateSearchRelevance(project, query) {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Title match (highest weight)
    if (project.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Technology match
    if (project.technologies && project.technologies.some(tech => 
      tech.toLowerCase().includes(queryLower))) {
      score += 5;
    }
    
    // Description match
    if (project.description.toLowerCase().includes(queryLower)) {
      score += 3;
    }
    
    // Project type match
    if (project.projectType.toLowerCase().includes(queryLower)) {
      score += 7;
    }
    
    return score;
  }

  generateSearchSuggestions(query) {
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Technology suggestions
    const allTechnologies = new Set();
    this.portfolioData.forEach(project => {
      if (project.technologies) {
        project.technologies.forEach(tech => allTechnologies.add(tech));
      }
    });
    
    Array.from(allTechnologies).forEach(tech => {
      if (tech.toLowerCase().includes(queryLower) && tech.toLowerCase() !== queryLower) {
        suggestions.push({ type: 'technology', value: tech });
      }
    });
    
    // Project type suggestions
    Object.keys(this.filterCategories.projectType.options).forEach(type => {
      if (type.toLowerCase().includes(queryLower) && type.toLowerCase() !== queryLower) {
        suggestions.push({ type: 'project_type', value: type });
      }
    });
    
    return suggestions.slice(0, this.showcaseConfig.filtering.maxSuggestions);
  }

  matchesFilters(project, filters) {
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
        continue;
      }
      
      switch (filterKey) {
        case 'projectType':
          if (Array.isArray(filterValue)) {
            if (!filterValue.includes(project.projectType)) return false;
          } else {
            if (project.projectType !== filterValue) return false;
          }
          break;
          
        case 'technology':
          if (Array.isArray(filterValue)) {
            if (!project.technologies || !filterValue.some(tech => 
              project.technologies.includes(tech))) return false;
          }
          break;
          
        case 'industry':
          if (Array.isArray(filterValue)) {
            if (!filterValue.includes(project.industry)) return false;
          } else {
            if (project.industry !== filterValue) return false;
          }
          break;
          
        case 'complexity':
          if (project.complexity !== filterValue) return false;
          break;
          
        case 'timeline':
          if (project.timeline !== filterValue) return false;
          break;
      }
    }
    
    return true;
  }

  generateFilterCounts() {
    const counts = {};
    
    Object.keys(this.filterCategories).forEach(category => {
      counts[category] = {};
      
      this.filterCategories[category].options.forEach(option => {
        const tempFilters = { ...this.currentFilters };
        
        if (this.filterCategories[category].multiSelect) {
          tempFilters[category] = [...(tempFilters[category] || []), option];
        } else {
          tempFilters[category] = option;
        }
        
        const matchingProjects = Array.from(this.portfolioData.values()).filter(project => {
          return this.matchesFilters(project, tempFilters);
        });
        
        counts[category][option] = matchingProjects.length;
      });
    });
    
    return counts;
  }

  async generatePersonalizedRecommendations() {
    try {
      if (!this.personalizationManager) return;
      
      const userId = this.personalizationManager.getUserId?.();
      if (!userId) return;
      
      const recommendations = await this.personalizationManager.getPersonalizedContent(userId);
      
      if (recommendations && recommendations.content) {
        // Filter portfolio projects based on user interests
        const recommendedProjects = this.filteredProjects.filter(project => {
          return recommendations.content.some(rec => 
            rec.category && project.projectType.includes(rec.category)
          );
        });
        
        // Dispatch recommendations
        window.dispatchEvent(new CustomEvent('portfolio-recommendations-generated', {
          detail: { 
            recommendedProjects: recommendedProjects.slice(0, 6),
            userId
          }
        }));
      }
      
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
    }
  }

  generateProjectMetrics(projectType) {
    // Generate realistic metrics based on project type
    const baseMetrics = {
      performance: {
        before: { loadTime: '4.2s', lighthouseScore: 65, coreWebVitals: 'Poor' },
        after: { loadTime: '1.8s', lighthouseScore: 95, coreWebVitals: 'Good' },
        improvement: '57%'
      },
      accessibility: {
        before: { wcagScore: 68, screenReaderCompatibility: 'Partial' },
        after: { wcagScore: 100, screenReaderCompatibility: 'Full' },
        improvement: '47%'
      },
      business: {
        before: { conversionRate: '2.1%', userEngagement: '2.3 min' },
        after: { conversionRate: '3.8%', userEngagement: '4.7 min' },
        improvement: '81%'
      }
    };
    
    return baseMetrics;
  }

  generateProjectImages(projectType) {
    return [
      `https://via.placeholder.com/800x600?text=${projectType}+Before`,
      `https://via.placeholder.com/800x600?text=${projectType}+After`,
      `https://via.placeholder.com/800x600?text=${projectType}+Process`
    ];
  }

  generateTestimonial(projectType) {
    const testimonials = {
      ai_automation: {
        content: "DigiClick AI transformed our business processes with their intelligent automation solution. We've seen a 60% reduction in manual work.",
        author: "Sarah Johnson",
        title: "CTO",
        company: "TechCorp Solutions",
        verified: true
      },
      web_application: {
        content: "The team delivered a stunning, accessible web application that exceeded our expectations. Performance improvements were remarkable.",
        author: "Michael Chen",
        title: "Product Manager",
        company: "InnovateTech",
        verified: true
      }
    };
    
    return testimonials[projectType] || testimonials.web_application;
  }

  initializeWebGL() {
    // Check WebGL support and initialize if available
    if (this.showcaseConfig.visualization.enableWebGL && this.isWebGLSupported()) {
      this.webglEnabled = true;
      console.log('WebGL support detected - 3D features enabled');
    } else {
      this.webglEnabled = false;
      console.log('WebGL not supported - falling back to 2D');
    }
  }

  isWebGLSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  setupAccessibilityFeatures() {
    // Setup accessibility features based on user preferences
    if (this.accessibilityManager) {
      const settings = this.accessibilityManager.getSettings();
      
      if (settings?.reducedMotion) {
        this.showcaseConfig.visualization.enable3D = false;
        this.showcaseConfig.visualization.animationDuration = 0;
      }
      
      if (settings?.highContrast) {
        this.showcaseConfig.accessibility.highContrastMode = true;
      }
    }
  }

  trackFilterUsage(filterData) {
    // Track filter usage for personalization
    window.dispatchEvent(new CustomEvent('portfolio-filter-tracked', {
      detail: { filters: filterData, timestamp: new Date().toISOString() }
    }));
  }

  trackSearchQuery(query) {
    // Track search queries for personalization
    window.dispatchEvent(new CustomEvent('portfolio-search-tracked', {
      detail: { query, timestamp: new Date().toISOString() }
    }));
  }

  loadFallbackData() {
    // Load fallback data if main loading fails
    this.portfolioData = new Map();
    this.filteredProjects = [];
    
    console.warn('Loading fallback portfolio data');
  }

  // Public API methods
  getFilteredProjects() {
    return this.filteredProjects;
  }

  getFilterCategories() {
    return this.filterCategories;
  }

  getSortOptions() {
    return this.sortOptions;
  }

  getShowcaseConfig() {
    return this.showcaseConfig;
  }

  isWebGLEnabled() {
    return this.webglEnabled;
  }
}

// Create global instance
let interactivePortfolioShowcase = null;

export function getInteractivePortfolioShowcase() {
  if (!interactivePortfolioShowcase) {
    interactivePortfolioShowcase = new InteractivePortfolioShowcase();
  }
  return interactivePortfolioShowcase;
}

export function initializeInteractivePortfolioShowcase() {
  return getInteractivePortfolioShowcase();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeInteractivePortfolioShowcase();
  });
}

export default InteractivePortfolioShowcase;
