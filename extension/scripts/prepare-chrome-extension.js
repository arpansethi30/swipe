// Chrome extension preparation script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const manifestPath = path.resolve(__dirname, '../manifest.json');

// Function to copy manifest.json to the dist directory
function copyManifest() {
  try {
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Update manifest version based on package.json
      const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
      manifest.version = packageJson.version;
      
      // Write the manifest to dist directory
      fs.writeFileSync(path.resolve(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
      console.log('✅ manifest.json copied to dist folder');
    } else {
      console.error('❌ manifest.json not found in the root directory');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error copying manifest.json:', error);
    process.exit(1);
  }
}

// Function to copy assets to the dist directory
function copyAssets() {
  const assetsDir = path.resolve(__dirname, '../public');
  const iconsDir = path.resolve(assetsDir, 'icons');
  const distIconsDir = path.resolve(distDir, 'icons');
  
  // Create icons directory in dist if it doesn't exist
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir, { recursive: true });
  }
  
  // Copy icons
  if (fs.existsSync(iconsDir)) {
    const icons = fs.readdirSync(iconsDir);
    icons.forEach(icon => {
      fs.copyFileSync(
        path.resolve(iconsDir, icon),
        path.resolve(distIconsDir, icon)
      );
    });
    console.log('✅ Icons copied to dist folder');
  } else {
    console.warn('⚠️ Icons directory not found');
  }
  
  // Copy any other necessary files (content scripts, etc.)
  const contentScriptSrc = path.resolve(__dirname, '../src/content.js');
  const contentScriptDest = path.resolve(distDir, 'content.js');
  
  if (fs.existsSync(contentScriptSrc)) {
    fs.copyFileSync(contentScriptSrc, contentScriptDest);
    console.log('✅ Content script copied to dist folder');
  } else {
    console.warn('⚠️ Content script not found');
  }
}

// Function to update HTML files to use correct paths
function updateHtmlFiles() {
  const htmlFile = path.resolve(distDir, 'index.html');
  
  if (fs.existsSync(htmlFile)) {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Update asset paths if necessary
    htmlContent = htmlContent.replace(/\/assets\//g, './assets/');
    
    fs.writeFileSync(htmlFile, htmlContent);
    console.log('✅ HTML files updated with correct paths');
  }
}

// Main function to prepare the Chrome extension
async function prepareExtension() {
  console.log('🔨 Preparing Chrome extension...');
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ Dist directory not found. Make sure to run build first.');
    process.exit(1);
  }
  
  copyManifest();
  copyAssets();
  updateHtmlFiles();
  
  console.log('✅ Chrome extension prepared successfully!');
  console.log('📂 You can now load the extension from the dist folder in Chrome.');
}

prepareExtension().catch(error => {
  console.error('❌ Error preparing extension:', error);
  process.exit(1);
});
