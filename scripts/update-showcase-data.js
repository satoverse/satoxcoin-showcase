#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Update showcase data file
 */
function updateShowcaseData() {
  console.log('🔄 Updating showcase data...');

  const projectsDir = path.join(__dirname, '..', 'projects');
  const showcaseData = {
    last_updated: new Date().toISOString(),
    total_projects: 0,
    categories: {},
    projects: [],
    statistics: {
      by_category: {},
      by_sdk: {},
      by_license: {},
      by_language: {}
    }
  };

  // Initialize category counters
  const categories = [
    'games', 'nft', 'ipfs', 'mobile', 'apps', 'components', 'sites', 'starters',
    'defi', 'security', 'analytics', 'tools', 'design', 'education', 'marketing',
    'integration', 'experimental', 'enterprise', 'entertainment', 'health',
    'real-estate', 'transportation', 'finance', 'academic', 'government',
    'sustainability', 'creative', 'competitions', 'ai-ml', 'web3', 'iot',
    'events', 'e-commerce', 'media', 'non-profit', 'productivity', 'custom'
  ];

  categories.forEach(category => {
    showcaseData.statistics.by_category[category] = 0;
  });

  // Scan all projects
  function scanProjects(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Check if this directory contains a project
          const projectJsonPath = path.join(fullPath, 'project.json');
          
          if (fs.existsSync(projectJsonPath)) {
            // This is a project directory
            try {
              const projectData = processProject(fullPath, projectJsonPath);
              if (projectData) {
                showcaseData.projects.push(projectData);
                showcaseData.total_projects++;
                
                // Update statistics
                updateStatistics(showcaseData.statistics, projectData);
              }
            } catch (error) {
              console.error(`❌ Error processing project ${fullPath}: ${error.message}`);
            }
          } else {
            // Recursively scan subdirectories
            scanProjects(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning directory ${dir}: ${error.message}`);
    }
  }

  scanProjects(projectsDir);

  // Sort projects by last updated
  showcaseData.projects.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));

  // Generate category summaries
  showcaseData.categories = generateCategorySummaries(showcaseData.projects);

  // Write showcase data
  const outputPath = path.join(__dirname, '..', 'showcase-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(showcaseData, null, 2));

  console.log(`✅ Updated showcase data with ${showcaseData.total_projects} projects`);
  console.log(`📊 Categories: ${Object.keys(showcaseData.categories).length}`);
  
  // Log statistics
  console.log('\n📈 Statistics:');
  console.log('By Category:');
  Object.entries(showcaseData.statistics.by_category)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

  console.log('\nBy SDK:');
  Object.entries(showcaseData.statistics.by_sdk)
    .sort(([_, a], [__, b]) => b - a)
    .forEach(([sdk, count]) => {
      console.log(`  ${sdk}: ${count}`);
    });

  return showcaseData;
}

/**
 * Process a single project
 * @param {string} projectPath - Path to project directory
 * @param {string} satoxJsonPath - Path to satox.json file
 * @returns {Object} Processed project data
 */
function processProject(projectPath, satoxJsonPath) {
  const metadata = JSON.parse(fs.readFileSync(satoxJsonPath, 'utf8'));
  
  // Validate required fields
  if (!metadata.name || !metadata.description || !metadata.author) {
    console.warn(`⚠️  Skipping project with missing required fields: ${projectPath}`);
    return null;
  }

  // Extract project path relative to projects directory
  const relativePath = path.relative(path.join(__dirname, '..', 'projects'), projectPath);
  const [username, projectName] = relativePath.split(path.sep);

  // Build project data
  const projectData = {
    id: `${username}/${projectName}`,
    username,
    project_name: projectName,
    name: metadata.name,
    description: metadata.description,
    author: metadata.author,
    category: metadata.category || 'custom',
    tags: metadata.tags || [],
    satox_sdks: metadata.satox_sdks || [],
    repository: metadata.repository,
    license: metadata.license,
    version: metadata.version || '1.0.0',
    last_updated: metadata.last_updated || new Date().toISOString(),
    preview: metadata.preview || {},
    stars: metadata.stars || 0,
    forks: metadata.forks || 0,
    downloads: metadata.downloads || 0,
    views: metadata.views || 0,
    featured: metadata.featured || false,
    verified: metadata.verified || false,
    status: metadata.status || 'active'
  };

  // Add screenshot paths if they exist
  const screenshotPaths = {};
  const viewports = ['desktop', 'tablet', 'mobile'];
  
  for (const viewport of viewports) {
    const screenshotPath = path.join(projectPath, `screenshot-${viewport}.png`);
    const thumbnailPath = path.join(projectPath, `thumbnail-${viewport}.png`);
    
    if (fs.existsSync(screenshotPath)) {
      screenshotPaths[viewport] = `projects/${relativePath}/screenshot-${viewport}.png`;
    }
    if (fs.existsSync(thumbnailPath)) {
      if (!screenshotPaths.thumbnails) screenshotPaths.thumbnails = {};
      screenshotPaths.thumbnails[viewport] = `projects/${relativePath}/thumbnail-${viewport}.png`;
    }
  }

  if (Object.keys(screenshotPaths).length > 0) {
    projectData.screenshots = screenshotPaths;
  }

  // Add demo video if it exists
  const videoPath = path.join(projectPath, 'preview.mp4');
  if (fs.existsSync(videoPath)) {
    projectData.demo_video = `projects/${relativePath}/preview.mp4`;
  }

  // Detect primary language
  projectData.language = detectPrimaryLanguage(projectPath);

  return projectData;
}

/**
 * Update statistics
 * @param {Object} statistics - Statistics object
 * @param {Object} projectData - Project data
 */
function updateStatistics(statistics, projectData) {
  // By category
  if (projectData.category) {
    statistics.by_category[projectData.category] = (statistics.by_category[projectData.category] || 0) + 1;
  }

  // By SDK
  projectData.satox_sdks.forEach(sdk => {
    statistics.by_sdk[sdk] = (statistics.by_sdk[sdk] || 0) + 1;
  });

  // By license
  if (projectData.license) {
    statistics.by_license[projectData.license] = (statistics.by_license[projectData.license] || 0) + 1;
  }

  // By language
  if (projectData.language) {
    statistics.by_language[projectData.language] = (statistics.by_language[projectData.language] || 0) + 1;
  }
}

/**
 * Generate category summaries
 * @param {Array} projects - Array of projects
 * @returns {Object} Category summaries
 */
function generateCategorySummaries(projects) {
  const summaries = {};
  
  projects.forEach(project => {
    const category = project.category;
    if (!summaries[category]) {
      summaries[category] = {
        name: category,
        count: 0,
        featured_projects: [],
        recent_projects: [],
        total_stars: 0,
        total_forks: 0,
        total_views: 0
      };
    }
    
    summaries[category].count++;
    summaries[category].total_stars += project.stars || 0;
    summaries[category].total_forks += project.forks || 0;
    summaries[category].total_views += project.views || 0;
    
    // Add to featured projects (top 3 by stars)
    if (project.featured) {
      summaries[category].featured_projects.push({
        id: project.id,
        name: project.name,
        description: project.description,
        author: project.author,
        stars: project.stars || 0
      });
    }
    
    // Add to recent projects (last 5 updated)
    summaries[category].recent_projects.push({
      id: project.id,
      name: project.name,
      description: project.description,
      author: project.author,
      last_updated: project.last_updated
    });
  });
  
  // Sort and limit featured and recent projects
  Object.values(summaries).forEach(summary => {
    summary.featured_projects.sort((a, b) => b.stars - a.stars).splice(3);
    summary.recent_projects.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)).splice(5);
  });
  
  return summaries;
}

/**
 * Detect primary language of project
 * @param {string} projectPath - Path to project directory
 * @returns {string} Primary language
 */
function detectPrimaryLanguage(projectPath) {
  const languageFiles = {
    'JavaScript': ['.js', '.jsx', '.ts', '.tsx'],
    'Python': ['.py'],
    'Go': ['.go'],
    'Rust': ['.rs'],
    'Java': ['.java'],
    'Kotlin': ['.kt'],
    'Swift': ['.swift'],
    'Dart': ['.dart'],
    'Solidity': ['.sol'],
    'HTML': ['.html'],
    'CSS': ['.css', '.scss', '.sass'],
    'PHP': ['.php'],
    'C#': ['.cs'],
    'C++': ['.cpp', '.cc', '.cxx'],
    'C': ['.c'],
    'Ruby': ['.rb'],
    'TypeScript': ['.ts', '.tsx']
  };

  const fileCounts = {};
  
  function countFiles(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          countFiles(filePath);
        } else if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();
          for (const [language, extensions] of Object.entries(languageFiles)) {
            if (extensions.includes(ext)) {
              fileCounts[language] = (fileCounts[language] || 0) + 1;
              break;
            }
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  countFiles(projectPath);

  // Return the language with the most files
  if (Object.keys(fileCounts).length === 0) {
    return 'Other';
  }

  return Object.entries(fileCounts)
    .sort(([_, a], [__, b]) => b - a)[0][0];
}

// CLI usage
if (require.main === module) {
  try {
    updateShowcaseData();
  } catch (error) {
    console.error(`❌ Failed to update showcase data: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { updateShowcaseData }; 