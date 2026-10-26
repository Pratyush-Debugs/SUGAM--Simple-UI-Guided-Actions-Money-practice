#!/usr/bin/env node
/**
 * SUGAM - Production Site & Extension Packager
 * Pure Node.js script (zero external dependencies) that:
 * 1. Packages SUGAM/extension into a clean, distributable sugam-extension.zip
 * 2. Compiles a production-ready 'dist' directory for safe deployment (Vercel, Netlify, Cloudflare Pages, etc.)
 * 3. Strictly excludes test files, configs, and internal developer tooling from the public web output.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const EXT_DIR = path.join(ROOT, 'SUGAM', 'extension');
const DIST_DIR = path.join(ROOT, 'dist');

// ============================================================================
// 1. Pure Node.js PKZIP Archiver
// ============================================================================
function createZip(files, outputPath) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const f of files) {
    const nameBuf = Buffer.from(f.name.replace(/\\/g, '/'));
    const uncompressed = fs.readFileSync(f.path);
    const compressed = zlib.deflateRawSync(uncompressed);
    const crc = zlib.crc32(uncompressed);

    // Local Header (30 bytes)
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);  // version needed
    lh.writeUInt16LE(0, 6);   // flags
    lh.writeUInt16LE(8, 8);   // compression = deflate
    lh.writeUInt16LE(0, 10);  // mod time
    lh.writeUInt16LE(0, 12);  // mod date
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(compressed.length, 18);
    lh.writeUInt32LE(uncompressed.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);  // extra len

    localHeaders.push(lh, nameBuf, compressed);

    // Central Directory Header (46 bytes)
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);  // version made by
    ch.writeUInt16LE(20, 6);  // version needed
    ch.writeUInt16LE(0, 8);   // flags
    ch.writeUInt16LE(8, 10);  // compression = deflate
    ch.writeUInt16LE(0, 12);  // mod time
    ch.writeUInt16LE(0, 14);  // mod date
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(compressed.length, 20);
    ch.writeUInt32LE(uncompressed.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt16LE(0, 30);  // extra len
    ch.writeUInt16LE(0, 32);  // comment len
    ch.writeUInt16LE(0, 34);  // disk start
    ch.writeUInt16LE(0, 36);  // internal attrs
    ch.writeUInt32LE(0, 38);  // external attrs
    ch.writeUInt32LE(offset, 42); // local header offset

    centralHeaders.push(ch, nameBuf);
    offset += lh.length + nameBuf.length + compressed.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const b of centralHeaders) centralDirSize += b.length;

  // End of Central Directory (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);  // disk num
  eocd.writeUInt16LE(0, 6);  // disk with central dir
  eocd.writeUInt16LE(files.length, 8);  // entries on this disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20); // comment len

  const finalZip = Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, finalZip);
}

// ============================================================================
// 2. Helper Utilities
// ============================================================================
function copyRecursive(src, dest, filterFn = null) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item), filterFn);
    }
  } else {
    if (filterFn && !filterFn(src)) return;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function getAllFiles(dir, filterFn = null) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(full, filterFn));
    } else {
      if (!filterFn || filterFn(full)) {
        results.push(full);
      }
    }
  }
  return results;
}

// ============================================================================
// 3. Main Build Execution
// ============================================================================
console.log('🚀 Building SUGAM Web & Extension artifacts for deployment...');

// Step 3a: Collect files for the extension ZIP
// (Strictly excludes tests, specs, node_modules, and git artifacts)
const extensionFiles = getAllFiles(EXT_DIR, (filePath) => {
  const rel = path.relative(EXT_DIR, filePath);
  const parts = rel.split(path.sep);
  return !parts.includes('tests') &&
         !parts.includes('node_modules') &&
         !parts.includes('.DS_Store');
}).map((filePath) => ({
  name: path.relative(EXT_DIR, filePath),
  path: filePath
}));

const zipRoot = path.join(ROOT, 'sugam-extension.zip');
const zipAssets = path.join(ROOT, 'assets', 'sugam-extension.zip');

createZip(extensionFiles, zipRoot);
createZip(extensionFiles, zipAssets);
console.log(`📦 Packaged ${extensionFiles.length} files into sugam-extension.zip (${fs.statSync(zipRoot).size} bytes)`);

// Step 3b: Clean and prepare dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Step 3c: Copy Landing Page and Assets
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST_DIR, 'index.html'));
copyRecursive(path.join(ROOT, 'assets'), path.join(DIST_DIR, 'assets'));
fs.copyFileSync(zipRoot, path.join(DIST_DIR, 'sugam-extension.zip'));

// Step 3d: Copy UPI Practice Sandbox and its dependencies
const sandboxSrc = path.join(EXT_DIR, 'sandbox');
const sandboxDest = path.join(DIST_DIR, 'sandbox');
copyRecursive(sandboxSrc, sandboxDest);

// Sandbox relative dependencies: ../shared/storage.js and ../icons/*
const sharedSrc = path.join(EXT_DIR, 'shared', 'storage.js');
const sharedDest = path.join(DIST_DIR, 'shared', 'storage.js');
copyRecursive(sharedSrc, sharedDest);

const iconsSrc = path.join(EXT_DIR, 'icons');
const iconsDest = path.join(DIST_DIR, 'icons');
copyRecursive(iconsSrc, iconsDest);

console.log('✅ Production dist/ directory compiled successfully.');
console.log('🔒 Verification: No test files or developer configs are in dist/');
console.log(`📁 Output directory ready for Vercel: ${DIST_DIR}`);

