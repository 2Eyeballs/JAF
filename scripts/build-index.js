#!/usr/bin/env node
// Generates posts/index.json from frontmatter in posts/*.md
// Run automatically by Netlify on every deploy

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../posts');
const outputFile = path.join(postsDir, 'index.json');

if (!fs.existsSync(postsDir)) {
  console.log('No posts/ directory found, skipping index build.');
  process.exit(0);
}

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
const index = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) continue;

  const fm = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) fm[key] = value;
  });

  if (!fm.title) continue;

  index.push({
    filename: file,
    title: fm.title,
    date: fm.date || '',
    author: fm.author || '',
    excerpt: fm.excerpt || ''
  });
}

// Sort newest first
index.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
console.log(`Built posts/index.json with ${index.length} post(s).`);
