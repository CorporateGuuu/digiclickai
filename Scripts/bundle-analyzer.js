#!/usr/bin/env node

/**
 * DigiClick AI Bundle Analysis and Optimization Script
 * Analyzes current bundle sizes and implements optimization strategies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.config = {
      target_js_size: 500 * 1024, // 500KB
      target_css_size: 100 * 1024, // 100KB
      variant_budgets: {
        control: 50 * 1024,    // 50KB
        enhanced: 75 * 1024,   // 75KB
        minimal: 30 * 1024,    // 30KB
        gaming: 100 * 1024     // 100KB
      }
    };
    
    this.analysis = {
      current_bundles: {},
      optimization_opportunities: [],
      variant_specific_chunks: {},
      recommendations: [],
      estimated_savings: 0
    };
  }

  async analyzeBundles() {
    console.log('📊 Analyzing DigiClick AI bundle sizes...');
    console.log('=' .repeat(80));

    try {
      // Analyze current build
      await this.analyzeCurrentBuild();
      
      // Identify optimization opportunities
      await this.identifyOptimizations();
      
      // Generate variant-specific chunk strategy
      await this.generateChunkStrategy();
      
      // Create optimization recommendations
      await this.createRecommendations();
      
      // Generate optimization report
      await this.generateOptimizationReport();
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      throw error;
    }

    return this.analysis;
  }

  async analyzeCurrentBuild() {
    console.log('🔍 Analyzing current build artifacts...');
    
    try {
      // Check if build exists
      const buildDir = path.join(process.cwd(), '.next');
      if (!fs.existsSync(buildDir)) {
        console.log('⚠️ No build found, creating production build...');
        execSync('npm run build', { stdio: 'inherit' });
      }
      
      // Analyze static chunks
      const staticDir = path.join(buildDir, 'static');
      if (fs.existsSync(staticDir)) {
        await this.analyzeStaticAssets(staticDir);
      }
      
      // Analyze pages
      const pagesDir = path.join(buildDir, 'server', 'pages');
      if (fs.existsSync(pagesDir)) {
        await this.analyzePageBundles(pagesDir);
      }
      
    } catch (error) {
      console.error('❌ Build analysis failed:', error);
      this.analysis.optimization_opportunities.push({
        type: 'build_analysis_error',
        description: 'Could not analyze current build',
        impact: 'high',
        recommendation: 'Ensure build completes successfully'
      });
    }
  }

  async analyzeStaticAssets(staticDir) {
    const chunks = path.join(staticDir, 'chunks');
    const css = path.join(staticDir, 'css');
    
    // Analyze JavaScript chunks
    if (fs.existsSync(chunks)) {
      const chunkFiles = fs.readdirSync(chunks).filter(file => file.endsWith('.js'));
      
      for (const file of chunkFiles) {
        const filePath = path.join(chunks, file);
        const stats = fs.statSync(filePath);
        
        this.analysis.current_bundles[file] = {
          size: stats.size,
          type: 'javascript',
          path: filePath,
          category: this.categorizeChunk(file)
        };
        
        // Check against targets
        if (stats.size > this.config.target_js_size) {
          this.analysis.optimization_opportunities.push({
            type: 'large_js_bundle',
            file: file,
            current_size: stats.size,
            target_size: this.config.target_js_size,
            impact: 'high',
            recommendation: 'Implement code splitting and dynamic imports'
          });
        }
      }
    }
    
    // Analyze CSS files
    if (fs.existsSync(css)) {
      const cssFiles = fs.readdirSync(css).filter(file => file.endsWith('.css'));
      
      for (const file of cssFiles) {
        const filePath = path.join(css, file);
        const stats = fs.statSync(filePath);
        
        this.analysis.current_bundles[file] = {
          size: stats.size,
          type: 'css',
          path: filePath,
          category: 'styles'
        };
        
        // Check against targets
        if (stats.size > this.config.target_css_size) {
          this.analysis.optimization_opportunities.push({
            type: 'large_css_bundle',
            file: file,
            current_size: stats.size,
            target_size: this.config.target_css_size,
            impact: 'medium',
            recommendation: 'Implement CSS code splitting and purging'
          });
        }
      }
    }
  }

  async analyzePageBundles(pagesDir) {
    const pageFiles = this.getAllFiles(pagesDir, '.js');
    
    for (const file of pageFiles) {
      const stats = fs.statSync(file);
      const relativePath = path.relative(pagesDir, file);
      
      this.analysis.current_bundles[relativePath] = {
        size: stats.size,
        type: 'page',
        path: file,
        category: this.categorizePageBundle(relativePath)
      };
    }
  }

  categorizeChunk(filename) {
    if (filename.includes('gsap') || filename.includes('animation')) {
      return 'animation';
    } else if (filename.includes('cursor')) {
      return 'cursor_system';
    } else if (filename.includes('ab-test') || filename.includes('analytics')) {
      return 'ab_testing';
    } else if (filename.includes('main') || filename.includes('app')) {
      return 'core';
    } else if (filename.includes('vendor') || filename.includes('node_modules')) {
      return 'vendor';
    }
    return 'other';
  }

  categorizePageBundle(relativePath) {
    if (relativePath.includes('cursor-context-demo')) {
      return 'cursor_demo';
    } else if (relativePath.includes('admin/ab-test')) {
      return 'ab_dashboard';
    } else if (relativePath.includes('index')) {
      return 'homepage';
    }
    return 'standard_page';
  }

  async identifyOptimizations() {
    console.log('🎯 Identifying optimization opportunities...');
    
    // GSAP optimization opportunities
    const gsapBundles = Object.entries(this.analysis.current_bundles)
      .filter(([name, bundle]) => bundle.category === 'animation');
    
    if (gsapBundles.length > 0) {
      const totalGsapSize = gsapBundles.reduce((sum, [, bundle]) => sum + bundle.size, 0);
      
      this.analysis.optimization_opportunities.push({
        type: 'gsap_optimization',
        description: 'GSAP library loaded unconditionally',
        current_size: totalGsapSize,
        estimated_savings: totalGsapSize * 0.6, // 60% savings with conditional loading
        impact: 'high',
        recommendation: 'Implement conditional GSAP loading based on A/B variant and device type'
      });
    }
    
    // Cursor system optimization
    const cursorBundles = Object.entries(this.analysis.current_bundles)
      .filter(([name, bundle]) => bundle.category === 'cursor_system');
    
    if (cursorBundles.length > 0) {
      this.analysis.optimization_opportunities.push({
        type: 'cursor_system_optimization',
        description: 'Cursor system components loaded for all variants',
        impact: 'medium',
        recommendation: 'Split cursor variants into separate chunks with dynamic loading'
      });
    }
    
    // Large vendor bundles
    const vendorBundles = Object.entries(this.analysis.current_bundles)
      .filter(([name, bundle]) => bundle.category === 'vendor' && bundle.size > 200 * 1024);
    
    for (const [name, bundle] of vendorBundles) {
      this.analysis.optimization_opportunities.push({
        type: 'large_vendor_bundle',
        file: name,
        current_size: bundle.size,
        impact: 'medium',
        recommendation: 'Consider vendor bundle splitting or alternative libraries'
      });
    }
  }

  async generateChunkStrategy() {
    console.log('📦 Generating variant-specific chunk strategy...');
    
    this.analysis.variant_specific_chunks = {
      control: {
        description: 'Minimal cursor functionality',
        includes: ['basic-cursor.js', 'core-interactions.js'],
        excludes: ['gsap.js', 'particles.js', 'advanced-animations.js'],
        estimated_size: this.config.variant_budgets.control
      },
      enhanced: {
        description: 'Enhanced cursor with particles',
        includes: ['enhanced-cursor.js', 'gsap-core.js', 'particles-light.js'],
        excludes: ['gaming-effects.js', 'rgb-animations.js'],
        estimated_size: this.config.variant_budgets.enhanced
      },
      minimal: {
        description: 'Lightweight cursor design',
        includes: ['minimal-cursor.js', 'css-animations.js'],
        excludes: ['gsap.js', 'particles.js', 'heavy-animations.js'],
        estimated_size: this.config.variant_budgets.minimal
      },
      gaming: {
        description: 'Full-featured gaming cursor',
        includes: ['gaming-cursor.js', 'gsap-full.js', 'particles-full.js', 'rgb-effects.js'],
        excludes: [],
        estimated_size: this.config.variant_budgets.gaming
      }
    };
  }

  async createRecommendations() {
    console.log('💡 Creating optimization recommendations...');
    
    this.analysis.recommendations = [
      {
        priority: 'high',
        category: 'Code Splitting',
        title: 'Implement Dynamic Imports for Cursor Variants',
        description: 'Split cursor system into variant-specific chunks loaded on demand',
        implementation: 'Create dynamic imports in cursor manager component',
        estimated_savings: '200-300KB',
        impact_on_fcp: '-400ms',
        files_to_modify: [
          'src/components/cursor/ABTestCursorManager.js',
          'src/components/cursor/variants/',
          'next.config.js'
        ]
      },
      {
        priority: 'high',
        category: 'GSAP Optimization',
        title: 'Conditional GSAP Loading',
        description: 'Load GSAP only for variants that require it and on non-touch devices',
        implementation: 'Implement lazy loading with device detection',
        estimated_savings: '150-200KB',
        impact_on_fcp: '-300ms',
        files_to_modify: [
          'src/lib/gsap-loader.js',
          'src/components/cursor/variants/EnhancedCursor.js',
          'src/components/cursor/variants/GamingCursor.js'
        ]
      },
      {
        priority: 'medium',
        category: 'Particles.js Optimization',
        title: 'Lazy Load Particles Background',
        description: 'Load particles.js only when needed with CSS fallback',
        implementation: 'Intersection observer with requestIdleCallback',
        estimated_savings: '80-120KB',
        impact_on_fcp: '-200ms',
        files_to_modify: [
          'src/components/ParticlesBackground.js',
          'src/styles/particles-fallback.css'
        ]
      },
      {
        priority: 'medium',
        category: 'Image Optimization',
        title: 'WebP Conversion and Lazy Loading',
        description: 'Convert images to WebP with JPEG fallbacks and implement lazy loading',
        implementation: 'Next.js Image component with responsive loading',
        estimated_savings: '60-70% image payload reduction',
        impact_on_lcp: '-500ms',
        files_to_modify: [
          'public/images/',
          'src/components/OptimizedImage.js',
          'next.config.js'
        ]
      },
      {
        priority: 'low',
        category: 'CSS Optimization',
        title: 'CSS Code Splitting and Purging',
        description: 'Split CSS by page and remove unused styles',
        implementation: 'PurgeCSS integration with Next.js',
        estimated_savings: '30-50KB',
        impact_on_fcp: '-100ms',
        files_to_modify: [
          'postcss.config.js',
          'tailwind.config.js',
          'src/styles/'
        ]
      }
    ];
    
    // Calculate total estimated savings
    this.analysis.estimated_savings = this.analysis.optimization_opportunities
      .reduce((sum, opp) => sum + (opp.estimated_savings || 0), 0);
  }

  getAllFiles(dir, extension) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (fullPath.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  async generateOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      current_bundle_analysis: this.analysis.current_bundles,
      optimization_opportunities: this.analysis.optimization_opportunities,
      variant_chunk_strategy: this.analysis.variant_specific_chunks,
      recommendations: this.analysis.recommendations,
      estimated_total_savings: this.analysis.estimated_savings,
      performance_targets: {
        lighthouse_score: '≥90',
        fcp_target: '<2.5s',
        lcp_target: '<4.0s',
        cls_target: '<0.1',
        cursor_fps_target: '60fps'
      },
      next_steps: [
        'Implement dynamic imports for cursor variants',
        'Set up conditional GSAP loading',
        'Configure particles.js lazy loading',
        'Optimize images with WebP conversion',
        'Set up CSS code splitting',
        'Run Lighthouse CI validation'
      ]
    };
    
    // Save report
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'bundle-optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Bundle Analysis Summary:');
    console.log(`Total bundles analyzed: ${Object.keys(this.analysis.current_bundles).length}`);
    console.log(`Optimization opportunities: ${this.analysis.optimization_opportunities.length}`);
    console.log(`Estimated savings: ${Math.round(this.analysis.estimated_savings / 1024)}KB`);
    console.log(`High priority recommendations: ${this.analysis.recommendations.filter(r => r.priority === 'high').length}`);
    console.log(`Report saved to: ${reportPath}`);
    
    return reportPath;
  }
}

// Export for use in other modules
module.exports = BundleAnalyzer;

// Run if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyzeBundles()
    .then((analysis) => {
      console.log('✅ Bundle analysis completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Bundle analysis failed:', error);
      process.exit(1);
    });
}
