#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Generate screenshots for a project
 * @param {string} projectPath - Path to the project directory
 */
async function generateScreenshot(projectPath) {
  const satoxJsonPath = path.join(projectPath, 'satox.json');
  
  if (!fs.existsSync(satoxJsonPath)) {
    console.log(`⚠️  No satox.json found in ${projectPath}, skipping screenshot generation`);
    return;
  }

  try {
    const metadata = JSON.parse(fs.readFileSync(satoxJsonPath, 'utf8'));
    
    // Check if project has a live demo
    if (!metadata.preview?.live_demo) {
      console.log(`⚠️  No live demo URL found for ${metadata.name}, skipping screenshot generation`);
      return;
    }

    console.log(`📸 Generating screenshot for ${metadata.name}...`);

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport sizes for different devices
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      
      try {
        // Navigate to the demo URL
        await page.goto(metadata.preview.live_demo, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Wait a bit for any animations to complete
        await page.waitForTimeout(2000);

        // Generate screenshot
        const screenshotPath = path.join(projectPath, `screenshot-${viewport.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
          quality: 80
        });

        console.log(`✅ Generated ${viewport.name} screenshot: ${screenshotPath}`);

        // Create thumbnail version
        const thumbnailPath = path.join(projectPath, `thumbnail-${viewport.name}.png`);
        await page.screenshot({
          path: thumbnailPath,
          fullPage: false,
          quality: 80
        });

        console.log(`✅ Generated ${viewport.name} thumbnail: ${thumbnailPath}`);

      } catch (error) {
        console.error(`❌ Failed to generate ${viewport.name} screenshot: ${error.message}`);
      }
    }

    await browser.close();

    // Update satox.json with screenshot paths
    metadata.preview.screenshots = {
      desktop: 'screenshot-desktop.png',
      tablet: 'screenshot-tablet.png',
      mobile: 'screenshot-mobile.png',
      thumbnails: {
        desktop: 'thumbnail-desktop.png',
        tablet: 'thumbnail-tablet.png',
        mobile: 'thumbnail-mobile.png'
      }
    };

    fs.writeFileSync(satoxJsonPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Updated satox.json with screenshot paths`);

  } catch (error) {
    console.error(`❌ Screenshot generation failed: ${error.message}`);
  }
}

/**
 * Generate screenshot for projects without live demo
 * @param {string} projectPath - Path to the project directory
 */
async function generateStaticScreenshot(projectPath) {
  const satoxJsonPath = path.join(projectPath, 'satox.json');
  
  if (!fs.existsSync(satoxJsonPath)) {
    return;
  }

  try {
    const metadata = JSON.parse(fs.readFileSync(satoxJsonPath, 'utf8'));
    
    // Check if project has a local HTML file
    const htmlFiles = ['index.html', 'demo.html', 'preview.html'];
    let htmlFile = null;
    
    for (const file of htmlFiles) {
      if (fs.existsSync(path.join(projectPath, file))) {
        htmlFile = file;
        break;
      }
    }

    if (!htmlFile) {
      console.log(`⚠️  No HTML file found for ${metadata.name}, skipping static screenshot`);
      return;
    }

    console.log(`📸 Generating static screenshot for ${metadata.name}...`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const htmlPath = `file://${path.resolve(path.join(projectPath, htmlFile))}`;
    
    await page.goto(htmlPath, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Generate desktop screenshot
    const screenshotPath = path.join(projectPath, 'screenshot-desktop.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      quality: 80
    });

    console.log(`✅ Generated static screenshot: ${screenshotPath}`);

    await browser.close();

    // Update satox.json
    if (!metadata.preview) metadata.preview = {};
    metadata.preview.screenshots = {
      desktop: 'screenshot-desktop.png'
    };

    fs.writeFileSync(satoxJsonPath, JSON.stringify(metadata, null, 2));

  } catch (error) {
    console.error(`❌ Static screenshot generation failed: ${error.message}`);
  }
}

// CLI usage
if (require.main === module) {
  const projectPath = process.argv[2];
  
  if (!projectPath) {
    console.error('Usage: node generate-screenshot.js <project-path>');
    process.exit(1);
  }

  (async () => {
    try {
      await generateScreenshot(projectPath);
      await generateStaticScreenshot(projectPath);
    } catch (error) {
      console.error(`❌ Screenshot generation failed: ${error.message}`);
      process.exit(1);
    }
  })();
}

module.exports = { generateScreenshot, generateStaticScreenshot }; 