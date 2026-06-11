const fs = require('fs');
const path = require('path');

// Paths
const docsDir = path.join(__dirname, '..', 'documentation', 'content', 'docs');
const metaPath = path.join(docsDir, 'meta.json');
const outputPath = path.join(__dirname, '..', 'GUIDE_UTILISATEUR_COMPLET.md');

if (!fs.existsSync(metaPath)) {
  console.error("Fichier meta.json introuvable à la structure attendue : " + metaPath);
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const pages = meta.pages;

let compiledContent = `# Guide d'Utilisation Complet - ModaDZ\n\n`;
compiledContent += `Ce document regroupe l'intégralité de la documentation utilisateur de **ModaDZ**, l'application de point de vente et de gestion de magasin de vêtements.\n\n`;

// Table of Contents Placeholder
let tocContent = `## Table des Matières\n\n`;
const chapters = [];

pages.forEach((pageName, index) => {
  const filePath = path.join(docsDir, `${pageName}.mdx`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Avertissement : Fichier manquant ${pageName}.mdx`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Parse frontmatter
  const fmMatch = content.match(/^---([\s\S]*?)---/);
  let title = pageName;
  let description = '';
  if (fmMatch) {
    const fmText = fmMatch[1];
    const titleMatch = fmText.match(/title:\s*(.*)/);
    const descMatch = fmText.match(/description:\s*(.*)/);
    if (titleMatch) title = titleMatch[1].replace(/['"]/g, '').trim();
    if (descMatch) description = descMatch[1].replace(/['"]/g, '').trim();
    
    // Strip frontmatter
    content = content.replace(/^---([\s\S]*?)---/, '');
  }

  // Find and replace the first # header
  let headingTitle = title;
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    headingTitle = h1Match[1].trim();
    // Replace only the first occurrence of # heading
    content = content.replace(/^#\s+(.+)$/m, `# ${index + 1}. ${headingTitle}`);
  } else {
    // Prepend heading if not found
    content = `# ${index + 1}. ${title}\n\n` + content;
  }

  // Convert custom MDX components
  
  // Callouts
  content = content.replace(/<Callout(?:\s+type="([^"]+)")?[^>]*>([\s\S]*?)<\/Callout>/gi, (match, type, inner) => {
    let emoji = '💡';
    let prefix = 'Note';
    const t = type ? type.trim().toLowerCase() : 'info';
    if (t === 'warning') {
      emoji = '⚠️';
      prefix = 'Avertissement';
    } else if (t === 'error' || t === 'danger') {
      emoji = '🛑';
      prefix = 'Attention';
    } else if (t === 'info') {
      emoji = '💡';
      prefix = 'Information';
    }
    const lines = inner.trim().split('\n');
    return `> ${emoji} **${prefix} :**\n` + lines.map(line => `> ${line}`).join('\n');
  });

  // Steps
  content = content.replace(/<\/?Steps>/gi, '');
  content = content.replace(/<Step>([\s\S]*?)<\/Step>/gi, '$1');

  // Cards
  content = content.replace(/<\/?Cards>/gi, '');
  content = content.replace(/<Card\s+([^>]+)\s*\/>/gi, (match, attrsStr) => {
    const titleMatch = attrsStr.match(/title="([^"]+)"/);
    const hrefMatch = attrsStr.match(/href="([^"]+)"/);
    const descMatch = attrsStr.match(/description="([^"]+)"/);
    const cTitle = titleMatch ? titleMatch[1] : '';
    const cHref = hrefMatch ? hrefMatch[1] : '';
    const cDesc = descMatch ? descMatch[1] : '';
    
    // Map documentation URLs to internal anchors in compiled doc
    let targetLink = cHref;
    if (cHref.startsWith('/docs/')) {
      const targetPage = cHref.replace('/docs/', '');
      const targetIdx = pages.indexOf(targetPage);
      if (targetIdx !== -1) {
        targetLink = `#chapter-${targetIdx + 1}`;
      }
    }
    
    return `- **[${cTitle}](${targetLink})** : ${cDesc}`;
  });

  // ScreenshotGallery
  content = content.replace(/<ScreenshotGallery[\s\S]*?\/>/gi, (match) => {
    const objRegex = /\{\s*[\s\S]*?\}\s*/g;
    const objs = match.match(objRegex) || [];
    const results = [];
    for (const obj of objs) {
      const srcMatch = obj.match(/src:\s*["']([^"']+)["']/);
      const altMatch = obj.match(/alt:\s*["']([^"']+)["']/);
      const capMatch = obj.match(/caption:\s*["']([^"']+)["']/);
      if (srcMatch) {
        const src = srcMatch[1];
        const alt = altMatch ? altMatch[1] : 'Screenshot';
        const caption = capMatch ? capMatch[1] : '';
        let str = `![${alt}](${src})`;
        if (caption) {
          str += `\n\n*${caption}*`;
        }
        results.push(str);
      }
    }
    return results.join('\n\n');
  });

  // Convert internal documentation links in content to internal anchors
  content = content.replace(/\]\(\/docs\/([a-zA-Z0-9_-]+)(#[a-zA-Z0-9_-]+)?\)/gi, (match, targetPage, targetAnchor) => {
    const targetIdx = pages.indexOf(targetPage);
    if (targetIdx !== -1) {
      return `](#chapter-${targetIdx + 1})`;
    }
    return match;
  });

  const slug = `chapter-${index + 1}`;
  
  // Save details for TOC
  chapters.push({
    num: index + 1,
    title: headingTitle,
    slug: slug,
    description: description
  });

  // Wrap section with an HTML anchor for navigation
  const sectionContent = `<a id="chapter-${index + 1}"></a>\n\n${content.trim()}\n\n---\n\n`;
  compiledContent += sectionContent;
});

// Compile TOC
chapters.forEach(ch => {
  tocContent += `- [Chapitre ${ch.num} : ${ch.title}](#${ch.slug})${ch.description ? ` - *${ch.description}*` : ''}\n`;
});
tocContent += `\n---\n\n`;

// Insert TOC after introduction
const insertionPoint = `# Guide d'Utilisation Complet - ModaDZ\n\nCe document regroupe l'intégralité de la documentation utilisateur de **ModaDZ**, l'application de point de vente et de gestion de magasin de vêtements.\n\n`;
compiledContent = compiledContent.replace(insertionPoint, insertionPoint + tocContent);

// Save file
fs.writeFileSync(outputPath, compiledContent, 'utf8');
console.log(`Documentation compilée avec succès dans : ${outputPath}`);
