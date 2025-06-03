/**
 * DigiClick AI Content Generator
 * AI-powered blog post suggestions, content creation, and quality scoring
 * Integrates with OpenAI API for intelligent content generation
 */

import { getOpenAIIntegrationManager } from './openai-integration-manager';
import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';

class AIContentGenerator {
  constructor() {
    this.openaiManager = null;
    this.backendManager = null;
    this.cacheManager = null;
    
    this.contentConfig = {
      blogPost: {
        minLength: 800,
        maxLength: 2500,
        targetReadabilityScore: 60, // Flesch Reading Ease
        requiredSections: ['introduction', 'main_content', 'conclusion', 'cta']
      },
      metaDescription: {
        minLength: 150,
        maxLength: 160,
        requiredElements: ['keyword', 'value_proposition', 'action']
      },
      titleTag: {
        minLength: 50,
        maxLength: 60,
        requiredElements: ['primary_keyword', 'brand']
      }
    };
    
    this.expertiseAreas = {
      'ai_automation': {
        keywords: ['AI automation', 'machine learning', 'artificial intelligence', 'automation tools'],
        topics: ['AI implementation', 'automation workflows', 'ML model deployment', 'AI ROI'],
        difficulty: 'advanced'
      },
      'web_development': {
        keywords: ['web development', 'React', 'Next.js', 'JavaScript', 'frontend'],
        topics: ['modern web frameworks', 'performance optimization', 'responsive design', 'PWA'],
        difficulty: 'intermediate'
      },
      'digital_transformation': {
        keywords: ['digital transformation', 'business automation', 'process optimization'],
        topics: ['digital strategy', 'technology adoption', 'change management', 'ROI measurement'],
        difficulty: 'business'
      },
      'accessibility': {
        keywords: ['web accessibility', 'WCAG', 'inclusive design', 'screen readers'],
        topics: ['accessibility compliance', 'inclusive UX', 'assistive technology', 'accessibility testing'],
        difficulty: 'intermediate'
      },
      'performance_optimization': {
        keywords: ['performance optimization', 'Core Web Vitals', 'page speed', 'SEO'],
        topics: ['performance metrics', 'optimization techniques', 'caching strategies', 'mobile performance'],
        difficulty: 'advanced'
      }
    };
    
    this.contentTemplates = {
      blogPost: {
        howTo: {
          structure: ['problem_statement', 'solution_overview', 'step_by_step', 'best_practices', 'conclusion'],
          tone: 'instructional',
          cta: 'implementation_offer'
        },
        caseStudy: {
          structure: ['challenge', 'approach', 'implementation', 'results', 'lessons_learned'],
          tone: 'professional',
          cta: 'consultation_offer'
        },
        industryInsight: {
          structure: ['trend_analysis', 'implications', 'opportunities', 'recommendations', 'future_outlook'],
          tone: 'thought_leadership',
          cta: 'expertise_showcase'
        },
        technical: {
          structure: ['technical_overview', 'implementation_details', 'code_examples', 'optimization_tips', 'conclusion'],
          tone: 'technical_authority',
          cta: 'development_services'
        }
      }
    };
    
    this.qualityMetrics = {
      readability: {
        weight: 0.25,
        targets: { min: 50, optimal: 65, max: 80 }
      },
      technicalAccuracy: {
        weight: 0.30,
        criteria: ['factual_correctness', 'technical_depth', 'current_information']
      },
      brandAlignment: {
        weight: 0.25,
        criteria: ['tone_consistency', 'value_proposition', 'expertise_demonstration']
      },
      seoOptimization: {
        weight: 0.20,
        criteria: ['keyword_density', 'meta_optimization', 'internal_linking']
      }
    };
    
    this.init();
  }

  async init() {
    this.openaiManager = getOpenAIIntegrationManager();
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    
    this.setupEventListeners();
    this.loadIndustryTrends();
  }

  setupEventListeners() {
    // Listen for content generation requests
    window.addEventListener('content-generation-requested', (e) => {
      this.handleContentGenerationRequest(e.detail);
    });

    // Listen for content quality analysis requests
    window.addEventListener('content-quality-analysis-requested', (e) => {
      this.analyzeContentQuality(e.detail);
    });

    // Listen for blog topic suggestions requests
    window.addEventListener('blog-topic-suggestions-requested', (e) => {
      this.generateBlogTopicSuggestions(e.detail);
    });
  }

  async generateBlogTopicSuggestions(options = {}) {
    try {
      const { expertiseArea, targetAudience = 'business_leaders', contentType = 'howTo' } = options;
      
      // Get current industry trends
      const trends = await this.getCurrentIndustryTrends(expertiseArea);
      
      // Analyze user engagement data
      const engagementData = await this.getEngagementData();
      
      // Generate topic suggestions
      const prompt = this.buildTopicSuggestionPrompt(expertiseArea, trends, engagementData, targetAudience);
      
      const suggestions = await this.openaiManager.generateAIResponse(prompt, null, 'content_generation');
      
      // Parse and structure suggestions
      const structuredSuggestions = this.parseTopicSuggestions(suggestions);
      
      // Score and rank suggestions
      const rankedSuggestions = await this.rankTopicSuggestions(structuredSuggestions, expertiseArea);
      
      // Cache suggestions
      await this.cacheManager.set(
        `content:topic_suggestions:${expertiseArea}:${targetAudience}`,
        rankedSuggestions,
        3600 // 1 hour TTL
      );
      
      // Dispatch suggestions event
      window.dispatchEvent(new CustomEvent('blog-topic-suggestions-generated', {
        detail: { suggestions: rankedSuggestions, expertiseArea, targetAudience }
      }));
      
      return rankedSuggestions;
      
    } catch (error) {
      console.error('Error generating blog topic suggestions:', error);
      return this.getFallbackTopicSuggestions(options.expertiseArea);
    }
  }

  async generateBlogPostOutline(topic, expertiseArea, contentType = 'howTo') {
    try {
      const template = this.contentTemplates.blogPost[contentType];
      const expertise = this.expertiseAreas[expertiseArea];
      
      const prompt = this.buildOutlineGenerationPrompt(topic, expertise, template);
      
      const outline = await this.openaiManager.generateAIResponse(prompt, null, 'content_generation');
      
      // Structure the outline
      const structuredOutline = this.parseOutline(outline, template);
      
      // Add SEO optimization suggestions
      structuredOutline.seoSuggestions = await this.generateSEOSuggestions(topic, expertiseArea);
      
      // Add call-to-action suggestions
      structuredOutline.ctaSuggestions = this.generateCTASuggestions(template.cta, expertiseArea);
      
      return structuredOutline;
      
    } catch (error) {
      console.error('Error generating blog post outline:', error);
      return this.getFallbackOutline(topic, contentType);
    }
  }

  async generateBlogPostContent(outline, expertiseArea, options = {}) {
    try {
      const { tone = 'professional', targetLength = 1500, includeCodeExamples = false } = options;
      
      const prompt = this.buildContentGenerationPrompt(outline, expertiseArea, tone, targetLength, includeCodeExamples);
      
      const content = await this.openaiManager.generateAIResponse(prompt, null, 'content_generation');
      
      // Structure the content
      const structuredContent = this.parseGeneratedContent(content, outline);
      
      // Analyze content quality
      const qualityScore = await this.analyzeContentQuality(structuredContent);
      
      // Optimize for SEO
      const optimizedContent = await this.optimizeContentForSEO(structuredContent, outline.seoSuggestions);
      
      return {
        content: optimizedContent,
        qualityScore,
        metadata: {
          wordCount: this.getWordCount(optimizedContent.body),
          readabilityScore: this.calculateReadabilityScore(optimizedContent.body),
          expertiseArea,
          generatedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Error generating blog post content:', error);
      throw new Error('Content generation failed');
    }
  }

  buildTopicSuggestionPrompt(expertiseArea, trends, engagementData, targetAudience) {
    const expertise = this.expertiseAreas[expertiseArea];
    
    let prompt = `Generate 10 compelling blog post topics for DigiClick AI, a cutting-edge technology company specializing in ${expertise.keywords.join(', ')}.

Target Audience: ${targetAudience}
Expertise Level: ${expertise.difficulty}

Current Industry Trends:
${trends.map(trend => `- ${trend.title}: ${trend.description}`).join('\n')}

High-Performing Content Themes:
${engagementData.topTopics.map(topic => `- ${topic.title} (${topic.engagement} engagement)`).join('\n')}

Requirements:
- Topics should demonstrate DigiClick AI's technical expertise and thought leadership
- Include actionable insights and practical value for readers
- Align with DigiClick AI's services: AI automation, web development, digital transformation
- Consider SEO potential and search intent
- Maintain professional, futuristic brand positioning

For each topic, provide:
1. Compelling headline
2. Target keyword
3. Content angle/approach
4. Estimated search volume potential
5. Difficulty level
6. Call-to-action suggestion

Format as JSON array with structured data.`;

    return prompt;
  }

  buildOutlineGenerationPrompt(topic, expertise, template) {
    return `Create a detailed blog post outline for: "${topic}"

Expertise Area: ${expertise.keywords.join(', ')}
Content Structure: ${template.structure.join(' → ')}
Tone: ${template.tone}

Requirements:
- Target length: 1500-2000 words
- Include SEO-optimized headings (H2, H3)
- Add key points for each section
- Include relevant technical details
- Suggest internal linking opportunities
- Maintain DigiClick AI's authority positioning
- Include practical examples and actionable insights

Structure the outline with:
1. Introduction (hook, problem statement, preview)
2. Main sections based on template structure
3. Conclusion with key takeaways
4. Call-to-action aligned with DigiClick AI services

Format as structured JSON with headings, subpoints, and metadata.`;
  }

  buildContentGenerationPrompt(outline, expertiseArea, tone, targetLength, includeCodeExamples) {
    const expertise = this.expertiseAreas[expertiseArea];
    
    return `Write a comprehensive blog post based on this outline:

${JSON.stringify(outline, null, 2)}

Requirements:
- Target length: ${targetLength} words
- Tone: ${tone}
- Expertise level: ${expertise.difficulty}
- Include code examples: ${includeCodeExamples}
- Maintain DigiClick AI's technical authority
- Use active voice and engaging language
- Include practical examples and case studies
- Optimize for readability (Flesch score 60-70)
- Include relevant keywords naturally
- Add internal linking suggestions
- Conclude with strong call-to-action

Brand Guidelines:
- DigiClick AI is a cutting-edge technology company
- Specializes in AI automation, web development, digital transformation
- Maintains futuristic, professional positioning
- Emphasizes accessibility, performance, and technical excellence
- Serves business leaders and technical decision-makers

Format as structured content with clear sections, headings, and metadata.`;
  }

  async analyzeContentQuality(content) {
    const scores = {};
    
    // Readability analysis
    scores.readability = this.calculateReadabilityScore(content.body || content);
    
    // Technical accuracy (simplified analysis)
    scores.technicalAccuracy = await this.analyzeTechnicalAccuracy(content);
    
    // Brand alignment
    scores.brandAlignment = this.analyzeBrandAlignment(content);
    
    // SEO optimization
    scores.seoOptimization = this.analyzeSEOOptimization(content);
    
    // Calculate overall score
    const overallScore = Object.entries(scores).reduce((total, [metric, score]) => {
      const weight = this.qualityMetrics[metric]?.weight || 0.25;
      return total + (score * weight);
    }, 0);
    
    return {
      overall: Math.round(overallScore),
      breakdown: scores,
      recommendations: this.generateQualityRecommendations(scores)
    };
  }

  calculateReadabilityScore(text) {
    // Simplified Flesch Reading Ease calculation
    const sentences = text.split(/[.!?]+/).length - 1;
    const words = text.split(/\s+/).length;
    const syllables = this.countSyllables(text);
    
    if (sentences === 0 || words === 0) return 0;
    
    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  countSyllables(text) {
    // Simplified syllable counting
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiou]{2,}/g, 'a')
      .replace(/[^aeiou]/g, '')
      .length || 1;
  }

  async analyzeTechnicalAccuracy(content) {
    // Simplified technical accuracy analysis
    const technicalTerms = [
      'API', 'JavaScript', 'React', 'Next.js', 'AI', 'machine learning',
      'accessibility', 'WCAG', 'performance', 'SEO', 'responsive design'
    ];
    
    const text = (content.body || content).toLowerCase();
    const termCount = technicalTerms.filter(term => text.includes(term.toLowerCase())).length;
    
    return Math.min(100, (termCount / technicalTerms.length) * 100);
  }

  analyzeBrandAlignment(content) {
    const brandKeywords = [
      'DigiClick AI', 'cutting-edge', 'innovation', 'technical excellence',
      'automation', 'digital transformation', 'professional', 'expertise'
    ];
    
    const text = (content.body || content).toLowerCase();
    const keywordCount = brandKeywords.filter(keyword => text.includes(keyword.toLowerCase())).length;
    
    return Math.min(100, (keywordCount / brandKeywords.length) * 100);
  }

  analyzeSEOOptimization(content) {
    // Simplified SEO analysis
    const text = content.body || content;
    const hasTitle = !!(content.title || content.heading);
    const hasMetaDescription = !!(content.metaDescription);
    const hasHeadings = /#{1,6}\s/.test(text) || /<h[1-6]/.test(text);
    const hasInternalLinks = /\[.*\]\(\/.*\)/.test(text) || /<a href="\//.test(text);
    
    const factors = [hasTitle, hasMetaDescription, hasHeadings, hasInternalLinks];
    const score = (factors.filter(Boolean).length / factors.length) * 100;
    
    return Math.round(score);
  }

  generateQualityRecommendations(scores) {
    const recommendations = [];
    
    if (scores.readability < 50) {
      recommendations.push('Improve readability by using shorter sentences and simpler words');
    }
    
    if (scores.technicalAccuracy < 70) {
      recommendations.push('Add more technical details and industry-specific terminology');
    }
    
    if (scores.brandAlignment < 80) {
      recommendations.push('Strengthen brand messaging and emphasize DigiClick AI\'s expertise');
    }
    
    if (scores.seoOptimization < 75) {
      recommendations.push('Optimize SEO elements including headings, meta description, and internal links');
    }
    
    return recommendations;
  }

  async getCurrentIndustryTrends(expertiseArea) {
    try {
      const cacheKey = `content:industry_trends:${expertiseArea}`;
      let trends = await this.cacheManager.get(cacheKey);
      
      if (!trends) {
        // In a real implementation, this would fetch from industry APIs
        trends = this.getFallbackTrends(expertiseArea);
        await this.cacheManager.set(cacheKey, trends, 86400); // 24 hours TTL
      }
      
      return trends;
    } catch (error) {
      console.error('Error getting industry trends:', error);
      return this.getFallbackTrends(expertiseArea);
    }
  }

  async getEngagementData() {
    try {
      const response = await this.backendManager.makeRequest('/api/analytics/content-engagement');
      
      if (response.ok) {
        return await response.json();
      }
      
      return this.getFallbackEngagementData();
    } catch (error) {
      console.error('Error getting engagement data:', error);
      return this.getFallbackEngagementData();
    }
  }

  getFallbackTrends(expertiseArea) {
    const fallbackTrends = {
      ai_automation: [
        { title: 'AI-Powered Business Process Automation', description: 'Growing adoption of AI for workflow optimization' },
        { title: 'Machine Learning in Customer Service', description: 'AI chatbots and automated support systems' }
      ],
      web_development: [
        { title: 'Next.js 14 and React Server Components', description: 'Latest developments in React ecosystem' },
        { title: 'Core Web Vitals and Performance Optimization', description: 'Google\'s focus on user experience metrics' }
      ],
      accessibility: [
        { title: 'WCAG 2.2 Updates and Compliance', description: 'New accessibility guidelines and requirements' },
        { title: 'AI-Powered Accessibility Testing', description: 'Automated tools for accessibility validation' }
      ]
    };
    
    return fallbackTrends[expertiseArea] || fallbackTrends.web_development;
  }

  getFallbackEngagementData() {
    return {
      topTopics: [
        { title: 'AI Implementation Guides', engagement: 'high' },
        { title: 'Performance Optimization Tips', engagement: 'medium' },
        { title: 'Accessibility Best Practices', engagement: 'high' }
      ]
    };
  }

  parseTopicSuggestions(suggestions) {
    try {
      return JSON.parse(suggestions);
    } catch (error) {
      // Fallback parsing for non-JSON responses
      return this.parseTopicSuggestionsText(suggestions);
    }
  }

  parseTopicSuggestionsText(text) {
    // Simple text parsing fallback
    const lines = text.split('\n').filter(line => line.trim());
    return lines.slice(0, 10).map((line, index) => ({
      id: `topic_${index + 1}`,
      title: line.replace(/^\d+\.\s*/, '').trim(),
      keyword: 'AI automation', // Default keyword
      approach: 'how-to guide',
      searchVolume: 'medium',
      difficulty: 'intermediate',
      cta: 'Learn more about our AI automation services'
    }));
  }

  async rankTopicSuggestions(suggestions, expertiseArea) {
    // Simple ranking based on expertise area alignment and potential impact
    return suggestions.map(suggestion => ({
      ...suggestion,
      score: this.calculateTopicScore(suggestion, expertiseArea)
    })).sort((a, b) => b.score - a.score);
  }

  calculateTopicScore(suggestion, expertiseArea) {
    let score = 50; // Base score
    
    const expertise = this.expertiseAreas[expertiseArea];
    if (expertise) {
      // Boost score for expertise area keywords
      expertise.keywords.forEach(keyword => {
        if (suggestion.title.toLowerCase().includes(keyword.toLowerCase())) {
          score += 20;
        }
      });
    }
    
    // Boost for high search volume
    if (suggestion.searchVolume === 'high') score += 15;
    if (suggestion.searchVolume === 'medium') score += 10;
    
    // Adjust for difficulty
    if (suggestion.difficulty === 'beginner') score += 5;
    if (suggestion.difficulty === 'advanced') score += 10;
    
    return Math.min(100, score);
  }

  getWordCount(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Public API methods
  async generateContent(type, options) {
    switch (type) {
      case 'blog_topics':
        return await this.generateBlogTopicSuggestions(options);
      case 'blog_outline':
        return await this.generateBlogPostOutline(options.topic, options.expertiseArea, options.contentType);
      case 'blog_content':
        return await this.generateBlogPostContent(options.outline, options.expertiseArea, options);
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
  }

  async scheduleContent(content, publishDate, socialMedia = false) {
    try {
      const scheduleData = {
        content,
        publishDate,
        socialMedia,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      
      const response = await this.backendManager.makeRequest('/api/content/schedule', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to schedule content');
    } catch (error) {
      console.error('Error scheduling content:', error);
      throw error;
    }
  }

  getContentMetrics() {
    return {
      qualityMetrics: this.qualityMetrics,
      expertiseAreas: Object.keys(this.expertiseAreas),
      contentTemplates: Object.keys(this.contentTemplates.blogPost),
      supportedContentTypes: ['blog_topics', 'blog_outline', 'blog_content']
    };
  }
}

// Create global instance
let aiContentGenerator = null;

export function getAIContentGenerator() {
  if (!aiContentGenerator) {
    aiContentGenerator = new AIContentGenerator();
  }
  return aiContentGenerator;
}

export function initializeAIContentGenerator() {
  return getAIContentGenerator();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAIContentGenerator();
  });
}

export default AIContentGenerator;
