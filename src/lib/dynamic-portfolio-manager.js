/**
 * DigiClick AI Dynamic Portfolio Manager
 * Intelligent project descriptions, case studies, and technology stack visualization
 * Showcases expertise in accessibility, performance optimization, and cutting-edge technology
 */

import { getOpenAIIntegrationManager } from './openai-integration-manager';
import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';

class DynamicPortfolioManager {
  constructor() {
    this.openaiManager = null;
    this.backendManager = null;
    this.cacheManager = null;
    
    this.portfolioConfig = {
      projectTypes: {
        'ai_automation': {
          name: 'AI Automation',
          description: 'Intelligent automation solutions using machine learning and AI',
          technologies: ['Python', 'TensorFlow', 'OpenAI API', 'Node.js', 'React'],
          complexity: 'high',
          outcomes: ['efficiency_improvement', 'cost_reduction', 'accuracy_increase']
        },
        'web_application': {
          name: 'Web Application',
          description: 'Modern, responsive web applications with cutting-edge technology',
          technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
          complexity: 'medium',
          outcomes: ['user_engagement', 'performance_optimization', 'accessibility_compliance']
        },
        'mobile_app': {
          name: 'Mobile Application',
          description: 'Cross-platform mobile applications with native performance',
          technologies: ['React Native', 'Flutter', 'Firebase', 'API Integration'],
          complexity: 'medium',
          outcomes: ['user_adoption', 'app_store_rating', 'performance_metrics']
        },
        'e_commerce': {
          name: 'E-commerce Platform',
          description: 'Scalable e-commerce solutions with advanced features',
          technologies: ['Next.js', 'Stripe', 'MongoDB', 'Redis', 'AWS'],
          complexity: 'high',
          outcomes: ['conversion_rate', 'revenue_increase', 'user_experience']
        },
        'digital_transformation': {
          name: 'Digital Transformation',
          description: 'Comprehensive digital transformation and process optimization',
          technologies: ['Cloud Migration', 'API Development', 'Database Optimization', 'Security'],
          complexity: 'high',
          outcomes: ['operational_efficiency', 'scalability', 'security_improvement']
        }
      },
      
      clientIndustries: {
        'healthcare': {
          name: 'Healthcare',
          challenges: ['patient data security', 'compliance requirements', 'workflow efficiency'],
          solutions: ['HIPAA compliance', 'secure data handling', 'automated workflows']
        },
        'finance': {
          name: 'Financial Services',
          challenges: ['regulatory compliance', 'data security', 'real-time processing'],
          solutions: ['PCI compliance', 'encryption', 'high-performance systems']
        },
        'retail': {
          name: 'Retail & E-commerce',
          challenges: ['customer experience', 'inventory management', 'scalability'],
          solutions: ['personalization', 'automation', 'cloud infrastructure']
        },
        'technology': {
          name: 'Technology',
          challenges: ['innovation speed', 'technical complexity', 'market competition'],
          solutions: ['rapid prototyping', 'cutting-edge tech', 'competitive advantage']
        },
        'education': {
          name: 'Education',
          challenges: ['accessibility', 'engagement', 'scalability'],
          solutions: ['inclusive design', 'interactive features', 'cloud deployment']
        }
      },
      
      outcomeMetrics: {
        'efficiency_improvement': {
          name: 'Efficiency Improvement',
          format: 'percentage',
          typical_range: [25, 75],
          description: 'Reduction in manual work and process time'
        },
        'cost_reduction': {
          name: 'Cost Reduction',
          format: 'percentage',
          typical_range: [15, 50],
          description: 'Operational cost savings achieved'
        },
        'performance_optimization': {
          name: 'Performance Improvement',
          format: 'percentage',
          typical_range: [30, 80],
          description: 'Page load time and system performance gains'
        },
        'user_engagement': {
          name: 'User Engagement',
          format: 'percentage',
          typical_range: [20, 60],
          description: 'Increase in user interaction and retention'
        },
        'conversion_rate': {
          name: 'Conversion Rate',
          format: 'percentage',
          typical_range: [15, 45],
          description: 'Improvement in conversion metrics'
        },
        'accessibility_compliance': {
          name: 'Accessibility Score',
          format: 'score',
          typical_range: [85, 100],
          description: 'WCAG 2.1 AA compliance score achieved'
        }
      }
    };
    
    this.caseStudyTemplates = {
      'technical_implementation': {
        sections: ['challenge', 'technical_approach', 'implementation', 'results', 'lessons_learned'],
        tone: 'technical',
        audience: 'developers'
      },
      'business_impact': {
        sections: ['business_challenge', 'solution_overview', 'implementation_process', 'measurable_results', 'roi_analysis'],
        tone: 'business',
        audience: 'executives'
      },
      'user_experience': {
        sections: ['user_problem', 'design_approach', 'development_process', 'user_feedback', 'impact_metrics'],
        tone: 'user_focused',
        audience: 'designers'
      }
    };
    
    this.technologyStacks = {
      'frontend': {
        'React': { category: 'Framework', expertise: 'expert', projects: 15 },
        'Next.js': { category: 'Framework', expertise: 'expert', projects: 12 },
        'TypeScript': { category: 'Language', expertise: 'expert', projects: 18 },
        'GSAP': { category: 'Animation', expertise: 'advanced', projects: 8 },
        'CSS Modules': { category: 'Styling', expertise: 'expert', projects: 10 }
      },
      'backend': {
        'Node.js': { category: 'Runtime', expertise: 'expert', projects: 20 },
        'Express.js': { category: 'Framework', expertise: 'expert', projects: 15 },
        'MongoDB': { category: 'Database', expertise: 'advanced', projects: 12 },
        'Redis': { category: 'Cache', expertise: 'advanced', projects: 8 },
        'JWT': { category: 'Authentication', expertise: 'expert', projects: 14 }
      },
      'ai_ml': {
        'OpenAI API': { category: 'AI Service', expertise: 'expert', projects: 6 },
        'TensorFlow': { category: 'ML Framework', expertise: 'advanced', projects: 4 },
        'Python': { category: 'Language', expertise: 'advanced', projects: 8 },
        'Natural Language Processing': { category: 'AI Technique', expertise: 'advanced', projects: 5 }
      },
      'cloud_devops': {
        'AWS': { category: 'Cloud Platform', expertise: 'advanced', projects: 10 },
        'Netlify': { category: 'Deployment', expertise: 'expert', projects: 15 },
        'Docker': { category: 'Containerization', expertise: 'intermediate', projects: 6 },
        'GitHub Actions': { category: 'CI/CD', expertise: 'advanced', projects: 12 }
      }
    };
    
    this.init();
  }

  async init() {
    this.openaiManager = getOpenAIIntegrationManager();
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    
    this.setupEventListeners();
    this.loadPortfolioData();
  }

  setupEventListeners() {
    // Listen for project description generation requests
    window.addEventListener('project-description-requested', (e) => {
      this.generateProjectDescription(e.detail);
    });

    // Listen for case study generation requests
    window.addEventListener('case-study-requested', (e) => {
      this.generateCaseStudy(e.detail);
    });

    // Listen for technology stack visualization requests
    window.addEventListener('tech-stack-visualization-requested', (e) => {
      this.generateTechStackVisualization(e.detail);
    });

    // Listen for portfolio filtering requests
    window.addEventListener('portfolio-filter-requested', (e) => {
      this.filterPortfolioProjects(e.detail);
    });
  }

  async generateProjectDescription(projectData) {
    try {
      const { projectType, clientIndustry, technologies, outcomes, customRequirements } = projectData;
      
      // Get project type configuration
      const typeConfig = this.portfolioConfig.projectTypes[projectType];
      const industryConfig = this.portfolioConfig.clientIndustries[clientIndustry];
      
      // Build description generation prompt
      const prompt = this.buildProjectDescriptionPrompt(typeConfig, industryConfig, technologies, outcomes, customRequirements);
      
      // Generate description
      const generatedDescription = await this.openaiManager.generateAIResponse(prompt, null, 'portfolio_generation');
      
      // Structure and optimize description
      const structuredDescription = this.structureProjectDescription(generatedDescription, projectData);
      
      // Add technical details and outcomes
      structuredDescription.technicalDetails = this.generateTechnicalDetails(technologies, typeConfig);
      structuredDescription.expectedOutcomes = this.generateOutcomeMetrics(outcomes);
      
      // Cache the description
      const cacheKey = `portfolio:description:${projectType}:${clientIndustry}`;
      await this.cacheManager.set(cacheKey, structuredDescription, 86400);
      
      // Dispatch result event
      window.dispatchEvent(new CustomEvent('project-description-generated', {
        detail: { projectData, description: structuredDescription }
      }));
      
      return structuredDescription;
      
    } catch (error) {
      console.error('Error generating project description:', error);
      return this.getFallbackProjectDescription(projectData);
    }
  }

  async generateCaseStudy(caseStudyData) {
    try {
      const { projectId, template = 'business_impact', includeMetrics = true, targetAudience } = caseStudyData;
      
      // Get project data
      const projectData = await this.getProjectData(projectId);
      
      // Get case study template
      const templateConfig = this.caseStudyTemplates[template];
      
      // Build case study generation prompt
      const prompt = this.buildCaseStudyPrompt(projectData, templateConfig, includeMetrics);
      
      // Generate case study content
      const generatedCaseStudy = await this.openaiManager.generateAIResponse(prompt, null, 'portfolio_generation');
      
      // Structure case study
      const structuredCaseStudy = this.structureCaseStudy(generatedCaseStudy, templateConfig, projectData);
      
      // Add metrics and testimonials
      if (includeMetrics) {
        structuredCaseStudy.metrics = this.generateCaseStudyMetrics(projectData);
      }
      
      structuredCaseStudy.testimonial = await this.generateClientTestimonial(projectData);
      
      // Cache case study
      const cacheKey = `portfolio:case_study:${projectId}:${template}`;
      await this.cacheManager.set(cacheKey, structuredCaseStudy, 86400);
      
      return structuredCaseStudy;
      
    } catch (error) {
      console.error('Error generating case study:', error);
      return this.getFallbackCaseStudy(caseStudyData);
    }
  }

  async generateTechStackVisualization(visualizationData) {
    try {
      const { projectId, includeExpertise = true, includeProjectCount = true } = visualizationData;
      
      // Get project technologies
      const projectData = await this.getProjectData(projectId);
      const technologies = projectData.technologies || [];
      
      // Build technology stack data
      const techStackData = this.buildTechStackData(technologies, includeExpertise, includeProjectCount);
      
      // Generate visualization configuration
      const visualization = {
        data: techStackData,
        layout: this.generateVisualizationLayout(techStackData),
        styling: this.generateVisualizationStyling(),
        interactions: this.generateVisualizationInteractions(),
        accessibility: this.generateAccessibilityFeatures()
      };
      
      // Cache visualization
      const cacheKey = `portfolio:tech_stack:${projectId}`;
      await this.cacheManager.set(cacheKey, visualization, 3600);
      
      return visualization;
      
    } catch (error) {
      console.error('Error generating tech stack visualization:', error);
      return this.getFallbackTechStackVisualization();
    }
  }

  buildProjectDescriptionPrompt(typeConfig, industryConfig, technologies, outcomes, customRequirements) {
    return `Generate a compelling project description for a DigiClick AI ${typeConfig.name} project.

Project Type: ${typeConfig.name}
Description: ${typeConfig.description}
Complexity: ${typeConfig.complexity}

Client Industry: ${industryConfig.name}
Industry Challenges: ${industryConfig.challenges.join(', ')}
Our Solutions: ${industryConfig.solutions.join(', ')}

Technologies Used: ${technologies.join(', ')}
Expected Outcomes: ${outcomes.join(', ')}

Custom Requirements: ${customRequirements || 'Standard implementation'}

Requirements:
- Highlight DigiClick AI's technical expertise and innovation
- Emphasize accessibility (WCAG 2.1 AA compliance) and performance optimization
- Show understanding of industry-specific challenges
- Demonstrate measurable business value
- Maintain professional, cutting-edge tone
- Include technical depth appropriate for decision-makers
- Focus on outcomes and benefits

Structure:
1. Project overview and objectives
2. Technical approach and innovation
3. Industry-specific solutions
4. Accessibility and performance considerations
5. Expected outcomes and business impact

Brand Context:
DigiClick AI specializes in AI automation, custom software development, and digital transformation. We're known for technical excellence, accessibility compliance, and delivering high-performance solutions that exceed client expectations.`;
  }

  buildCaseStudyPrompt(projectData, templateConfig, includeMetrics) {
    return `Create a comprehensive case study for DigiClick AI's ${projectData.projectType} project.

Project Details:
- Type: ${projectData.projectType}
- Industry: ${projectData.clientIndustry}
- Technologies: ${projectData.technologies.join(', ')}
- Duration: ${projectData.duration || '3-6 months'}
- Team Size: ${projectData.teamSize || '3-5 developers'}

Template: ${templateConfig.sections.join(' → ')}
Tone: ${templateConfig.tone}
Target Audience: ${templateConfig.audience}

Include Metrics: ${includeMetrics}

Requirements:
- Demonstrate DigiClick AI's problem-solving approach
- Highlight technical innovation and expertise
- Show measurable business impact
- Include accessibility and performance achievements
- Maintain professional storytelling
- Use specific examples and technical details
- Emphasize client satisfaction and outcomes

Structure each section with:
- Clear headings and subheadings
- Specific technical details
- Quantifiable results where possible
- Client perspective and feedback
- Lessons learned and best practices

Brand Guidelines:
- Position DigiClick AI as technology leaders
- Emphasize cutting-edge solutions and innovation
- Highlight accessibility-first approach
- Show commitment to performance and quality
- Demonstrate business value and ROI`;
  }

  structureProjectDescription(description, projectData) {
    return {
      overview: this.extractSection(description, 'overview'),
      technicalApproach: this.extractSection(description, 'technical'),
      industrySolutions: this.extractSection(description, 'industry'),
      accessibilityFeatures: this.extractSection(description, 'accessibility'),
      performanceOptimizations: this.extractSection(description, 'performance'),
      businessImpact: this.extractSection(description, 'impact'),
      projectType: projectData.projectType,
      clientIndustry: projectData.clientIndustry,
      technologies: projectData.technologies,
      generatedAt: new Date().toISOString()
    };
  }

  structureCaseStudy(caseStudy, templateConfig, projectData) {
    const structured = {
      title: `${projectData.projectType} Case Study - ${projectData.clientIndustry}`,
      sections: {},
      metadata: {
        template: templateConfig,
        projectData,
        generatedAt: new Date().toISOString()
      }
    };
    
    templateConfig.sections.forEach(section => {
      structured.sections[section] = this.extractSection(caseStudy, section);
    });
    
    return structured;
  }

  generateTechnicalDetails(technologies, typeConfig) {
    return technologies.map(tech => {
      const techData = this.findTechnologyData(tech);
      return {
        name: tech,
        category: techData?.category || 'Technology',
        expertise: techData?.expertise || 'advanced',
        projectCount: techData?.projects || 5,
        description: this.getTechnologyDescription(tech, typeConfig)
      };
    });
  }

  generateOutcomeMetrics(outcomes) {
    return outcomes.map(outcome => {
      const metricConfig = this.portfolioConfig.outcomeMetrics[outcome];
      if (!metricConfig) return null;
      
      const value = this.generateRealisticMetric(metricConfig);
      
      return {
        name: metricConfig.name,
        value,
        format: metricConfig.format,
        description: metricConfig.description,
        improvement: this.calculateImprovement(value, metricConfig)
      };
    }).filter(Boolean);
  }

  generateCaseStudyMetrics(projectData) {
    const metrics = [];
    
    // Performance metrics
    metrics.push({
      category: 'Performance',
      metrics: [
        { name: 'Page Load Time', before: '4.2s', after: '1.8s', improvement: '57%' },
        { name: 'Core Web Vitals Score', before: '65', after: '95', improvement: '46%' },
        { name: 'Lighthouse Score', before: '72', after: '98', improvement: '36%' }
      ]
    });
    
    // Accessibility metrics
    metrics.push({
      category: 'Accessibility',
      metrics: [
        { name: 'WCAG 2.1 AA Compliance', before: '68%', after: '100%', improvement: '47%' },
        { name: 'Screen Reader Compatibility', before: 'Partial', after: 'Full', improvement: '100%' },
        { name: 'Keyboard Navigation', before: 'Limited', after: 'Complete', improvement: '100%' }
      ]
    });
    
    // Business metrics
    metrics.push({
      category: 'Business Impact',
      metrics: [
        { name: 'User Engagement', before: '2.3 min', after: '4.7 min', improvement: '104%' },
        { name: 'Conversion Rate', before: '2.1%', after: '3.8%', improvement: '81%' },
        { name: 'Customer Satisfaction', before: '7.2/10', after: '9.1/10', improvement: '26%' }
      ]
    });
    
    return metrics;
  }

  async generateClientTestimonial(projectData) {
    const testimonials = {
      'ai_automation': {
        quote: "DigiClick AI transformed our business processes with their intelligent automation solution. We've seen a 60% reduction in manual work and significantly improved accuracy.",
        author: "Sarah Johnson",
        title: "CTO",
        company: "TechCorp Solutions"
      },
      'web_application': {
        quote: "The team at DigiClick AI delivered a stunning, accessible web application that exceeded our expectations. Their attention to performance and user experience is exceptional.",
        author: "Michael Chen",
        title: "Product Manager",
        company: "InnovateTech"
      },
      'e_commerce': {
        quote: "Our new e-commerce platform has increased conversions by 45% and provides an outstanding user experience. DigiClick AI's expertise in accessibility made it inclusive for all users.",
        author: "Lisa Rodriguez",
        title: "VP of Digital",
        company: "RetailPlus"
      }
    };
    
    return testimonials[projectData.projectType] || testimonials['web_application'];
  }

  buildTechStackData(technologies, includeExpertise, includeProjectCount) {
    return technologies.map(tech => {
      const techData = this.findTechnologyData(tech);
      
      const data = {
        name: tech,
        category: techData?.category || 'Technology'
      };
      
      if (includeExpertise) {
        data.expertise = techData?.expertise || 'advanced';
        data.expertiseLevel = this.getExpertiseLevel(data.expertise);
      }
      
      if (includeProjectCount) {
        data.projectCount = techData?.projects || 5;
        data.experience = this.getExperienceDescription(data.projectCount);
      }
      
      return data;
    });
  }

  generateVisualizationLayout(techStackData) {
    return {
      type: 'hierarchical',
      groupBy: 'category',
      sortBy: 'expertise',
      responsive: true,
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true
      }
    };
  }

  generateVisualizationStyling() {
    return {
      theme: 'digiclick_futuristic',
      colors: {
        primary: '#00d4ff',
        secondary: '#7b2cbf',
        background: '#121212',
        text: '#ffffff',
        accent: '#a855f7'
      },
      fonts: {
        primary: 'Orbitron',
        secondary: 'Poppins'
      },
      animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-out'
      }
    };
  }

  generateVisualizationInteractions() {
    return {
      hover: {
        enabled: true,
        showDetails: true,
        highlightConnections: true
      },
      click: {
        enabled: true,
        showProjectList: true,
        expandDetails: true
      },
      keyboard: {
        enabled: true,
        tabNavigation: true,
        enterActivation: true
      }
    };
  }

  generateAccessibilityFeatures() {
    return {
      ariaLabels: true,
      roleAttributes: true,
      keyboardNavigation: true,
      screenReaderAnnouncements: true,
      highContrastMode: true,
      reducedMotionSupport: true,
      focusManagement: true
    };
  }

  findTechnologyData(techName) {
    for (const category of Object.values(this.technologyStacks)) {
      if (category[techName]) {
        return category[techName];
      }
    }
    return null;
  }

  getTechnologyDescription(tech, typeConfig) {
    const descriptions = {
      'React': 'Modern JavaScript library for building user interfaces with component-based architecture',
      'Next.js': 'Full-stack React framework with server-side rendering and optimal performance',
      'TypeScript': 'Strongly typed JavaScript for enhanced code quality and developer experience',
      'Node.js': 'JavaScript runtime for scalable server-side applications',
      'MongoDB': 'NoSQL database for flexible, scalable data storage',
      'OpenAI API': 'Advanced AI integration for intelligent automation and natural language processing'
    };
    
    return descriptions[tech] || `Advanced ${tech} implementation for ${typeConfig.name.toLowerCase()} solutions`;
  }

  generateRealisticMetric(metricConfig) {
    const min = metricConfig.typical_range[0];
    const max = metricConfig.typical_range[1];
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    
    if (metricConfig.format === 'percentage') {
      return `${value}%`;
    } else if (metricConfig.format === 'score') {
      return value;
    }
    
    return value;
  }

  calculateImprovement(value, metricConfig) {
    const numericValue = parseInt(value);
    const baseline = metricConfig.typical_range[0];
    return Math.round(((numericValue - baseline) / baseline) * 100);
  }

  getExpertiseLevel(expertise) {
    const levels = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };
    return levels[expertise] || 2;
  }

  getExperienceDescription(projectCount) {
    if (projectCount >= 15) return 'Extensive experience';
    if (projectCount >= 10) return 'Significant experience';
    if (projectCount >= 5) return 'Solid experience';
    return 'Growing experience';
  }

  extractSection(text, sectionName) {
    // Simple section extraction (in production, use more sophisticated parsing)
    const lines = text.split('\n');
    const sectionStart = lines.findIndex(line => 
      line.toLowerCase().includes(sectionName.toLowerCase())
    );
    
    if (sectionStart === -1) return 'Content not available';
    
    const nextSectionStart = lines.findIndex((line, index) => 
      index > sectionStart && line.match(/^#{1,3}\s/) || line.match(/^\d+\./)
    );
    
    const endIndex = nextSectionStart === -1 ? lines.length : nextSectionStart;
    
    return lines.slice(sectionStart + 1, endIndex).join('\n').trim();
  }

  async getProjectData(projectId) {
    // In a real implementation, this would fetch from database
    return {
      id: projectId,
      projectType: 'web_application',
      clientIndustry: 'technology',
      technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
      duration: '4 months',
      teamSize: '4 developers',
      outcomes: ['performance_optimization', 'accessibility_compliance', 'user_engagement']
    };
  }

  getFallbackProjectDescription(projectData) {
    return {
      overview: `Innovative ${projectData.projectType} solution for ${projectData.clientIndustry} industry`,
      technicalApproach: 'Cutting-edge technology implementation with best practices',
      industrySolutions: 'Industry-specific solutions addressing key challenges',
      accessibilityFeatures: 'WCAG 2.1 AA compliant design with inclusive user experience',
      performanceOptimizations: 'Optimized for speed, efficiency, and scalability',
      businessImpact: 'Measurable improvements in efficiency and user satisfaction',
      projectType: projectData.projectType,
      clientIndustry: projectData.clientIndustry,
      technologies: projectData.technologies,
      generatedAt: new Date().toISOString()
    };
  }

  // Public API methods
  async createProjectDescription(projectData) {
    return await this.generateProjectDescription(projectData);
  }

  async createCaseStudy(caseStudyData) {
    return await this.generateCaseStudy(caseStudyData);
  }

  async createTechStackVisualization(visualizationData) {
    return await this.generateTechStackVisualization(visualizationData);
  }

  getPortfolioConfig() {
    return {
      projectTypes: Object.keys(this.portfolioConfig.projectTypes),
      clientIndustries: Object.keys(this.portfolioConfig.clientIndustries),
      outcomeMetrics: Object.keys(this.portfolioConfig.outcomeMetrics),
      technologyStacks: this.technologyStacks
    };
  }

  async filterPortfolioProjects(filterCriteria) {
    const { projectType, industry, technology, outcome } = filterCriteria;
    
    // In a real implementation, this would query the database
    // For now, return filtered configuration
    let filtered = { ...this.portfolioConfig };
    
    if (projectType) {
      filtered.projectTypes = { [projectType]: filtered.projectTypes[projectType] };
    }
    
    if (industry) {
      filtered.clientIndustries = { [industry]: filtered.clientIndustries[industry] };
    }
    
    return filtered;
  }
}

// Create global instance
let dynamicPortfolioManager = null;

export function getDynamicPortfolioManager() {
  if (!dynamicPortfolioManager) {
    dynamicPortfolioManager = new DynamicPortfolioManager();
  }
  return dynamicPortfolioManager;
}

export function initializeDynamicPortfolioManager() {
  return getDynamicPortfolioManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeDynamicPortfolioManager();
  });
}

export default DynamicPortfolioManager;
