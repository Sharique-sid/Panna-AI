#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create extension package
async function packageExtension() {
  const extensionDir = path.join(__dirname, '../extension');
  const outputPath = path.join(__dirname, '../panna-ai-extension.zip');
  
  // Remove old package if exists
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  
  // Create zip archive
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    console.log(`✅ Extension packaged successfully!`);
    console.log(`📦 Package size: ${archive.pointer()} bytes`);
    console.log(`📁 Output: ${outputPath}`);
  });
  
  archive.on('error', (err) => {
    throw err;
  });
  
  archive.pipe(output);
  
  // Add extension files
  const filesToInclude = [
    'manifest.json',
    'popup.html',
    'popup.js',
    'background.js',
    'content-script.js',
    'icons/',
    'INSTALL.md'
  ];
  
  filesToInclude.forEach(file => {
    const filePath = path.join(extensionDir, file);
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        archive.directory(filePath, `icons`);
      } else {
        archive.file(filePath, { name: file });
      }
    }
  });
  
  await archive.finalize();
}

// Run packaging
packageExtension().catch(console.error);
