#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * AI-powered project categorization
 * @param {string} projectPath - Path to the project directory
 */
function categorizeProject(projectPath) {
  const satoxJsonPath = path.join(projectPath, 'satox.json');
  
  if (!fs.existsSync(satoxJsonPath)) {
    console.log(`⚠️  No satox.json found in ${projectPath}, skipping categorization`);
    return;
  }

  try {
    const metadata = JSON.parse(fs.readFileSync(satoxJsonPath, 'utf8'));
    
    // Skip if already categorized
    if (metadata.category && metadata.category !== 'custom') {
      console.log(`ℹ️  Project ${metadata.name} already categorized as: ${metadata.category}`);
      return;
    }

    console.log(`🏷️  Categorizing project: ${metadata.name}`);

    // Collect project data for analysis
    const projectData = collectProjectData(projectPath, metadata);
    
    // Analyze and categorize
    const category = analyzeAndCategorize(projectData);
    
    // Update metadata
    metadata.category = category;
    metadata.last_updated = new Date().toISOString();
    
    fs.writeFileSync(satoxJsonPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Categorized ${metadata.name} as: ${category}`);

  } catch (error) {
    console.error(`❌ Categorization failed: ${error.message}`);
  }
}

/**
 * Collect project data for analysis
 * @param {string} projectPath - Path to the project directory
 * @param {Object} metadata - Project metadata
 * @returns {Object} Collected project data
 */
function collectProjectData(projectPath, metadata) {
  const data = {
    name: metadata.name,
    description: metadata.description,
    tags: metadata.tags || [],
    satox_sdks: metadata.satox_sdks || [],
    files: [],
    keywords: []
  };

  // Collect file information
  function scanDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (stat.isFile()) {
          data.files.push({
            name: file,
            path: filePath.replace(projectPath, ''),
            extension: path.extname(file)
          });
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  scanDirectory(projectPath);

  // Extract keywords from various sources
  data.keywords = extractKeywords(metadata, data.files);

  return data;
}

/**
 * Extract keywords from project data
 * @param {Object} metadata - Project metadata
 * @param {Array} files - Project files
 * @returns {Array} Extracted keywords
 */
function extractKeywords(metadata, files) {
  const keywords = new Set();

  // Add keywords from name and description
  const text = `${metadata.name} ${metadata.description}`.toLowerCase();
  const commonKeywords = [
    'game', 'gaming', 'play', 'player', 'score', 'level', 'rpg', 'strategy', 'arcade',
    'nft', 'token', 'collection', 'marketplace', 'mint', 'trade', 'auction',
    'mobile', 'app', 'ios', 'android', 'react native', 'flutter',
    'defi', 'finance', 'lending', 'staking', 'yield', 'swap', 'dex',
    'security', 'wallet', 'authentication', 'encryption', 'audit',
    'analytics', 'dashboard', 'chart', 'metrics', 'data', 'visualization',
    'tool', 'cli', 'api', 'sdk', 'library', 'utility',
    'design', 'ui', 'ux', 'component', 'theme', 'style',
    'education', 'tutorial', 'course', 'learning', 'documentation',
    'marketing', 'seo', 'social', 'email', 'campaign',
    'integration', 'payment', 'cloud', 'database', 'external',
    'experimental', 'research', 'prototype', 'beta', 'alpha',
    'enterprise', 'business', 'saas', 'b2b', 'corporate',
    'entertainment', 'media', 'streaming', 'music', 'video',
    'health', 'medical', 'fitness', 'wellness', 'telemedicine',
    'real estate', 'property', 'housing', 'investment',
    'transportation', 'logistics', 'delivery', 'tracking',
    'finance', 'banking', 'investment', 'insurance',
    'academic', 'research', 'publishing', 'collaboration',
    'government', 'civic', 'voting', 'public service',
    'sustainability', 'environment', 'carbon', 'green',
    'creative', 'art', 'music', 'writing', 'photography',
    'competition', 'hackathon', 'contest', 'challenge',
    'ai', 'ml', 'machine learning', 'artificial intelligence',
    'web3', 'blockchain', 'crypto', 'decentralized',
    'iot', 'internet of things', 'smart home', 'sensor',
    'event', 'ticketing', 'conference', 'meetup',
    'ecommerce', 'shopping', 'marketplace', 'retail',
    'media', 'news', 'blog', 'podcast', 'publishing',
    'nonprofit', 'charity', 'donation', 'fundraising',
    'productivity', 'workflow', 'automation', 'collaboration'
  ];

  for (const keyword of commonKeywords) {
    if (text.includes(keyword)) {
      keywords.add(keyword);
    }
  }

  // Add keywords from file extensions and names
  const fileKeywords = {
    '.js': ['javascript', 'web', 'frontend'],
    '.ts': ['typescript', 'web', 'frontend'],
    '.jsx': ['react', 'frontend'],
    '.tsx': ['react', 'typescript', 'frontend'],
    '.vue': ['vue', 'frontend'],
    '.py': ['python', 'backend', 'ai', 'ml'],
    '.go': ['golang', 'backend'],
    '.rs': ['rust', 'backend'],
    '.java': ['java', 'backend'],
    '.kt': ['kotlin', 'android', 'mobile'],
    '.swift': ['swift', 'ios', 'mobile'],
    '.dart': ['dart', 'flutter', 'mobile'],
    '.sol': ['solidity', 'blockchain', 'smart contract'],
    '.html': ['web', 'frontend'],
    '.css': ['web', 'frontend', 'design'],
    '.scss': ['web', 'frontend', 'design'],
    '.json': ['data', 'configuration'],
    '.yaml': ['data', 'configuration'],
    '.md': ['documentation'],
    '.sh': ['script', 'automation'],
    '.dockerfile': ['container', 'deployment'],
    '.yml': ['configuration', 'deployment']
  };

  for (const file of files) {
    const ext = file.extension.toLowerCase();
    if (fileKeywords[ext]) {
      fileKeywords[ext].forEach(keyword => keywords.add(keyword));
    }
  }

  // Add keywords from package.json if exists
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(dep => {
          if (dep.includes('react')) keywords.add('react');
          if (dep.includes('vue')) keywords.add('vue');
          if (dep.includes('angular')) keywords.add('angular');
          if (dep.includes('next')) keywords.add('nextjs');
          if (dep.includes('nuxt')) keywords.add('nuxt');
          if (dep.includes('express')) keywords.add('express');
          if (dep.includes('fastapi')) keywords.add('fastapi');
          if (dep.includes('django')) keywords.add('django');
          if (dep.includes('flask')) keywords.add('flask');
          if (dep.includes('tensorflow')) keywords.add('ai');
          if (dep.includes('pytorch')) keywords.add('ai');
          if (dep.includes('ethers')) keywords.add('blockchain');
          if (dep.includes('web3')) keywords.add('blockchain');
        });
      }
    } catch (error) {
      // Ignore package.json parsing errors
    }
  }

  return Array.from(keywords);
}

/**
 * Analyze project data and determine category
 * @param {Object} projectData - Collected project data
 * @returns {string} Determined category
 */
function analyzeAndCategorize(projectData) {
  const { keywords, satox_sdks, files } = projectData;
  
  // Category scoring system
  const categoryScores = {
    games: 0,
    nft: 0,
    ipfs: 0,
    mobile: 0,
    apps: 0,
    components: 0,
    sites: 0,
    starters: 0,
    defi: 0,
    security: 0,
    analytics: 0,
    tools: 0,
    design: 0,
    education: 0,
    marketing: 0,
    integration: 0,
    experimental: 0,
    enterprise: 0,
    entertainment: 0,
    health: 0,
    'real-estate': 0,
    transportation: 0,
    finance: 0,
    academic: 0,
    government: 0,
    sustainability: 0,
    creative: 0,
    competitions: 0,
    'ai-ml': 0,
    web3: 0,
    iot: 0,
    events: 0,
    'e-commerce': 0,
    media: 0,
    'non-profit': 0,
    productivity: 0,
    custom: 0
  };

  // Score based on keywords
  const keywordScores = {
    // Games
    'game': { games: 10, entertainment: 5 },
    'gaming': { games: 10, entertainment: 5 },
    'play': { games: 8, entertainment: 4 },
    'player': { games: 8 },
    'score': { games: 6 },
    'level': { games: 6 },
    'rpg': { games: 12 },
    'strategy': { games: 8 },
    'arcade': { games: 10 },

    // NFT
    'nft': { nft: 15, web3: 8 },
    'token': { nft: 8, defi: 6, web3: 6 },
    'collection': { nft: 10 },
    'marketplace': { nft: 8, 'e-commerce': 6 },
    'mint': { nft: 8 },
    'trade': { nft: 6, defi: 6 },
    'auction': { nft: 8 },

    // Mobile
    'mobile': { mobile: 15 },
    'ios': { mobile: 12 },
    'android': { mobile: 12 },
    'react native': { mobile: 12 },
    'flutter': { mobile: 12 },
    'dart': { mobile: 8 },

    // DeFi
    'defi': { defi: 15, finance: 8 },
    'finance': { defi: 8, finance: 10 },
    'lending': { defi: 10 },
    'staking': { defi: 10 },
    'yield': { defi: 10 },
    'swap': { defi: 8 },
    'dex': { defi: 12 },

    // Security
    'security': { security: 15 },
    'wallet': { security: 10, web3: 6 },
    'authentication': { security: 10 },
    'encryption': { security: 12 },
    'audit': { security: 8 },

    // Analytics
    'analytics': { analytics: 15 },
    'dashboard': { analytics: 10 },
    'chart': { analytics: 8 },
    'metrics': { analytics: 8 },
    'data': { analytics: 6 },
    'visualization': { analytics: 10 },

    // Tools
    'tool': { tools: 12 },
    'cli': { tools: 10 },
    'api': { tools: 8, integration: 6 },
    'sdk': { tools: 8 },
    'library': { tools: 8 },
    'utility': { tools: 8 },

    // Design
    'design': { design: 15 },
    'ui': { design: 12 },
    'ux': { design: 12 },
    'component': { components: 12, design: 6 },
    'theme': { design: 8 },
    'style': { design: 6 },

    // Education
    'education': { education: 15 },
    'tutorial': { education: 12 },
    'course': { education: 12 },
    'learning': { education: 10 },
    'documentation': { education: 8 },

    // Marketing
    'marketing': { marketing: 15 },
    'seo': { marketing: 10 },
    'social': { marketing: 8 },
    'email': { marketing: 6 },
    'campaign': { marketing: 8 },

    // Integration
    'integration': { integration: 15 },
    'payment': { integration: 8, finance: 6 },
    'cloud': { integration: 6 },
    'database': { integration: 6 },
    'external': { integration: 6 },

    // Experimental
    'experimental': { experimental: 15 },
    'research': { experimental: 12, academic: 8 },
    'prototype': { experimental: 10 },
    'beta': { experimental: 8 },
    'alpha': { experimental: 8 },

    // Enterprise
    'enterprise': { enterprise: 15 },
    'business': { enterprise: 8 },
    'saas': { enterprise: 10 },
    'b2b': { enterprise: 10 },
    'corporate': { enterprise: 8 },

    // Entertainment
    'entertainment': { entertainment: 15 },
    'media': { entertainment: 8, media: 10 },
    'streaming': { entertainment: 10 },
    'music': { entertainment: 8, creative: 6 },
    'video': { entertainment: 8, media: 6 },

    // Health
    'health': { health: 15 },
    'medical': { health: 12 },
    'fitness': { health: 10 },
    'wellness': { health: 8 },
    'telemedicine': { health: 12 },

    // Real Estate
    'real estate': { 'real-estate': 15 },
    'property': { 'real-estate': 12 },
    'housing': { 'real-estate': 10 },
    'investment': { 'real-estate': 6, finance: 6 },

    // Transportation
    'transportation': { transportation: 15 },
    'logistics': { transportation: 12 },
    'delivery': { transportation: 10 },
    'tracking': { transportation: 8 },

    // Finance
    'banking': { finance: 12 },
    'insurance': { finance: 10 },

    // Academic
    'academic': { academic: 15 },
    'publishing': { academic: 10, media: 6 },
    'collaboration': { academic: 8, productivity: 6 },

    // Government
    'government': { government: 15 },
    'civic': { government: 12 },
    'voting': { government: 10 },
    'public service': { government: 12 },

    // Sustainability
    'sustainability': { sustainability: 15 },
    'environment': { sustainability: 12 },
    'carbon': { sustainability: 10 },
    'green': { sustainability: 8 },

    // Creative
    'creative': { creative: 15 },
    'art': { creative: 12 },
    'writing': { creative: 10 },
    'photography': { creative: 10 },

    // Competitions
    'competition': { competitions: 15 },
    'hackathon': { competitions: 15 },
    'contest': { competitions: 12 },
    'challenge': { competitions: 10 },

    // AI/ML
    'ai': { 'ai-ml': 15 },
    'ml': { 'ai-ml': 15 },
    'machine learning': { 'ai-ml': 15 },
    'artificial intelligence': { 'ai-ml': 15 },
    'tensorflow': { 'ai-ml': 12 },
    'pytorch': { 'ai-ml': 12 },

    // Web3
    'web3': { web3: 15 },
    'blockchain': { web3: 12 },
    'crypto': { web3: 10 },
    'decentralized': { web3: 8 },
    'ethers': { web3: 8 },
    'solidity': { web3: 10 },

    // IoT
    'iot': { iot: 15 },
    'internet of things': { iot: 15 },
    'smart home': { iot: 12 },
    'sensor': { iot: 10 },

    // Events
    'event': { events: 15 },
    'ticketing': { events: 12 },
    'conference': { events: 10 },
    'meetup': { events: 8 },

    // E-commerce
    'ecommerce': { 'e-commerce': 15 },
    'shopping': { 'e-commerce': 12 },
    'retail': { 'e-commerce': 10 },

    // Media
    'news': { media: 12 },
    'blog': { media: 10 },
    'podcast': { media: 10 },

    // Non-profit
    'nonprofit': { 'non-profit': 15 },
    'charity': { 'non-profit': 12 },
    'donation': { 'non-profit': 10 },
    'fundraising': { 'non-profit': 10 },

    // Productivity
    'productivity': { productivity: 15 },
    'workflow': { productivity: 10 },
    'automation': { productivity: 8 }
  };

  // Apply keyword scores
  for (const keyword of keywords) {
    if (keywordScores[keyword]) {
      for (const [category, score] of Object.entries(keywordScores[keyword])) {
        categoryScores[category] += score;
      }
    }
  }

  // Score based on Satox SDKs used
  if (satox_sdks.includes('satox-game-sdk')) {
    categoryScores.games += 20;
  }
  if (satox_sdks.includes('satox-mobile-sdk')) {
    categoryScores.mobile += 20;
  }
  if (satox_sdks.includes('satox-sdk')) {
    categoryScores.web3 += 10;
  }

  // Score based on file types
  const hasReact = files.some(f => f.name.includes('react') || f.extension === '.jsx' || f.extension === '.tsx');
  const hasVue = files.some(f => f.name.includes('vue') || f.extension === '.vue');
  const hasMobile = files.some(f => f.name.includes('android') || f.name.includes('ios') || f.extension === '.kt' || f.extension === '.swift');
  const hasBlockchain = files.some(f => f.extension === '.sol' || f.name.includes('contract'));

  if (hasReact) categoryScores.apps += 5;
  if (hasVue) categoryScores.apps += 5;
  if (hasMobile) categoryScores.mobile += 10;
  if (hasBlockchain) categoryScores.web3 += 10;

  // Find the category with the highest score
  let bestCategory = 'custom';
  let bestScore = 0;

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // If no clear category, default to apps
  if (bestScore < 5) {
    bestCategory = 'apps';
  }

  return bestCategory;
}

// CLI usage
if (require.main === module) {
  const projectPath = process.argv[2];
  
  if (!projectPath) {
    console.error('Usage: node categorize-project.js <project-path>');
    process.exit(1);
  }

  try {
    categorizeProject(projectPath);
  } catch (error) {
    console.error(`❌ Categorization failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { categorizeProject, analyzeAndCategorize }; 