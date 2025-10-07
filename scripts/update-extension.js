#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Updating Panna.ai Extension Package...');

try {
  // Remove old package if exists
  const publicDir = path.join(__dirname, '../public');
  const zipPath = path.join(publicDir, 'panna-ai-extension.zip');
  
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
    console.log('🗑️  Removed old extension package');
  }
  
  // Create new package using PowerShell (Windows) or zip (Linux/Mac)
  const extensionDir = path.join(__dirname, '../extension');
  
  if (process.platform === 'win32') {
    // Windows PowerShell
    execSync(`powershell -Command "Compress-Archive -Path '${extensionDir}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });
  } else {
    // Linux/Mac
    execSync(`cd '${extensionDir}' && zip -r '${zipPath}' .`, { stdio: 'inherit' });
  }
  
  // Get file size
  const stats = fs.statSync(zipPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ Extension package updated successfully!');
  console.log(`📦 Package size: ${fileSizeInMB} MB`);
  console.log(`📁 Location: ${zipPath}`);
  console.log('🌐 Available at: https://panna-ai-bice.vercel.app/panna-ai-extension.zip');
  
} catch (error) {
  console.error('❌ Error updating extension package:', error.message);
  process.exit(1);
}
