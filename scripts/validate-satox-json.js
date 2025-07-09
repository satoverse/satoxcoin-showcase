#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validate satox.json metadata file
 * @param {string} projectPath - Path to the project directory
 */
function validateSatoxJson(projectPath) {
  const satoxJsonPath = path.join(projectPath, 'satox.json');
  
  if (!fs.existsSync(satoxJsonPath)) {
    throw new Error(`Missing satox.json in ${projectPath}`);
  }

  try {
    const content = fs.readFileSync(satoxJsonPath, 'utf8');
    const metadata = JSON.parse(content);

    // Required fields
    const requiredFields = [
      'name',
      'description',
      'author',
      'category',
      'satox_sdks',
      'repository',
      'license'
    ];

    for (const field of requiredFields) {
      if (!metadata[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate author object
    if (!metadata.author.username || !metadata.author.name) {
      throw new Error('Author must have username and name');
    }

    // Validate category
    const validCategories = [
      'games', 'nft', 'ipfs', 'mobile', 'apps', 'components', 'sites', 'starters',
      'defi', 'security', 'analytics', 'tools', 'design', 'education', 'marketing',
      'integration', 'experimental', 'enterprise', 'entertainment', 'health',
      'real-estate', 'transportation', 'finance', 'academic', 'government',
      'sustainability', 'creative', 'competitions', 'ai-ml', 'web3', 'iot',
      'events', 'e-commerce', 'media', 'non-profit', 'productivity', 'custom'
    ];

    if (!validCategories.includes(metadata.category)) {
      throw new Error(`Invalid category: ${metadata.category}. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate Satox SDKs
    const validSDKs = ['satox-sdk', 'satox-game-sdk', 'satox-mobile-sdk'];
    for (const sdk of metadata.satox_sdks) {
      if (!validSDKs.includes(sdk)) {
        throw new Error(`Invalid SDK: ${sdk}. Must be one of: ${validSDKs.join(', ')}`);
      }
    }

    // Validate repository URL
    if (!metadata.repository.startsWith('https://github.com/')) {
      throw new Error('Repository must be a GitHub URL');
    }

    // Validate license
    const validLicenses = [
      'MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Unlicense',
      'CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'CC-BY-NC-4.0'
    ];
    if (!validLicenses.includes(metadata.license)) {
      throw new Error(`Invalid license: ${metadata.license}. Must be one of: ${validLicenses.join(', ')}`);
    }

    // Validate version format
    if (metadata.version && !/^\d+\.\d+\.\d+/.test(metadata.version)) {
      throw new Error('Version must be in semantic versioning format (e.g., 1.0.0)');
    }

    // Validate tags
    if (metadata.tags && !Array.isArray(metadata.tags)) {
      throw new Error('Tags must be an array');
    }

    // Validate preview object
    if (metadata.preview) {
      if (metadata.preview.live_demo && !metadata.preview.live_demo.startsWith('http')) {
        throw new Error('Live demo must be a valid URL');
      }
    }

    console.log(`✅ Validated satox.json for ${metadata.name}`);
    return metadata;

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in satox.json: ${error.message}`);
    }
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const projectPath = process.argv[2];
  
  if (!projectPath) {
    console.error('Usage: node validate-satox-json.js <project-path>');
    process.exit(1);
  }

  try {
    validateSatoxJson(projectPath);
  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { validateSatoxJson }; 