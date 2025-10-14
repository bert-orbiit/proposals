const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

// Configuration
const PROPOSALS_DIR = path.join(__dirname, '..', 'proposals');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const CSS_PATH = path.join(ASSETS_DIR, 'css', 'proposal-style.css');
const LOGO_PATH = path.join(ASSETS_DIR, 'ATH_logo_transparent.png.png');

// Company information
const COMPANY_INFO = {
  name: 'Ask the Human LLC',
  email: 'bert@askthehuman.com',
  address: '426 Maplegrove Drive',
  city: 'Franklin, TN 37064',
  country: 'United States'
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Parse command line arguments
const args = process.argv.slice(2);
const buildAll = args.includes('--all');
const watchMode = args.includes('--watch');
const specificFile = args.find(arg => arg.endsWith('.md'));

// Custom marked renderer for better formatting
const renderer = new marked.Renderer();

// Add custom rendering for tables to ensure proper styling
renderer.table = function(header, body) {
  return '<table>\n<thead>\n' + header + '</thead>\n<tbody>\n' + body + '</tbody>\n</table>\n';
};

// Add custom rendering for code blocks to support Mermaid
renderer.code = function(code, language) {
  if (language === 'mermaid') {
    return `<pre class="mermaid">${code}</pre>\n`;
  }
  // Default code block rendering
  const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<pre><code class="${language || ''}">${escaped}</code></pre>\n`;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: false
});

// Extract frontmatter from markdown
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content: content };
  }

  const metadata = {};
  const frontmatterLines = match[1].split('\n');

  frontmatterLines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      metadata[key.trim()] = value;
    }
  });

  return { metadata, content: match[2] };
}

// Replace template variables in content
function replaceTemplateVars(content, metadata) {
  let result = content;

  // Replace metadata variables
  Object.keys(metadata).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, metadata[key]);
  });

  // Replace company info
  result = result.replace(/{{company\.name}}/g, COMPANY_INFO.name);
  result = result.replace(/{{company\.email}}/g, COMPANY_INFO.email);
  result = result.replace(/{{company\.address}}/g, COMPANY_INFO.address);

  return result;
}

// Generate HTML from markdown
function generateHTML(markdownContent, metadata) {
  const { content } = extractFrontmatter(markdownContent);
  const processedContent = replaceTemplateVars(content, metadata);
  const htmlContent = marked.parse(processedContent);

  // Read CSS
  const css = fs.readFileSync(CSS_PATH, 'utf-8');

  // Convert logo to base64 for embedding
  let logoBase64 = '';
  if (fs.existsSync(LOGO_PATH)) {
    const logoBuffer = fs.readFileSync(LOGO_PATH);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  }

  // Generate full HTML document with Mermaid support
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title || 'Proposal'} - ${COMPANY_INFO.name}</title>
  <style>${css}</style>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    });
  </script>
</head>
<body>
  ${logoBase64 ? `
  <div class="header-logo">
    <img src="${logoBase64}" alt="${COMPANY_INFO.name}" style="max-width: 200px; height: auto;">
  </div>
  ` : ''}
  <div class="document-content">
    ${htmlContent}
  </div>
  <div class="footer">
    ${COMPANY_INFO.name} | ${COMPANY_INFO.email} | ${COMPANY_INFO.address}, ${COMPANY_INFO.city}
  </div>
</body>
</html>`;

  return html;
}

// Convert HTML to PDF using Puppeteer
async function generatePDF(html, outputPath) {
  console.log(`Generating PDF: ${path.basename(outputPath)}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for Mermaid diagrams to render
    // Check if there are any mermaid diagrams
    const hasMermaid = html.includes('class="mermaid"');
    if (hasMermaid) {
      try {
        // Wait for mermaid to be defined and diagrams to be rendered
        await page.waitForFunction(
          () => {
            const mermaidElements = document.querySelectorAll('.mermaid');
            if (mermaidElements.length === 0) return true; // No mermaid, continue

            // Check if at least one mermaid element has SVG content (rendered)
            for (let elem of mermaidElements) {
              if (elem.querySelector('svg')) return true;
            }
            return false;
          },
          { timeout: 10000 }
        );
        console.log('  Mermaid diagrams rendered');
      } catch (err) {
        console.log('  Warning: Mermaid rendering timeout, proceeding anyway');
      }
      // Additional buffer for any animations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in'
      },
      displayHeaderFooter: false
    });

    console.log(`✓ PDF generated: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Error generating PDF: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
}

// Process a single markdown file
async function processFile(filePath) {
  try {
    console.log(`\nProcessing: ${path.basename(filePath)}`);

    // Read markdown file
    const markdownContent = fs.readFileSync(filePath, 'utf-8');

    // Extract metadata
    const { metadata, content } = extractFrontmatter(markdownContent);

    // Generate HTML
    const html = generateHTML(markdownContent, metadata);

    // Generate output filename
    const baseName = path.basename(filePath, '.md');
    const pdfPath = path.join(OUTPUT_DIR, `${baseName}.pdf`);
    const htmlPath = path.join(OUTPUT_DIR, `${baseName}.html`);

    // Save HTML for preview
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`✓ HTML saved: ${htmlPath}`);

    // Generate PDF
    await generatePDF(html, pdfPath);

    return true;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Find all markdown files in proposals directory
function findMarkdownFiles() {
  if (!fs.existsSync(PROPOSALS_DIR)) {
    console.warn(`Proposals directory not found: ${PROPOSALS_DIR}`);
    return [];
  }

  const files = fs.readdirSync(PROPOSALS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(PROPOSALS_DIR, file));

  return files;
}

// Main execution
async function main() {
  console.log('=== Ask the Human Proposal Builder ===\n');

  let filesToProcess = [];

  if (specificFile) {
    const fullPath = path.resolve(specificFile);
    if (fs.existsSync(fullPath)) {
      filesToProcess = [fullPath];
    } else {
      console.error(`File not found: ${specificFile}`);
      process.exit(1);
    }
  } else if (buildAll) {
    filesToProcess = findMarkdownFiles();
    if (filesToProcess.length === 0) {
      console.log('No markdown files found in proposals directory.');
      process.exit(0);
    }
    console.log(`Found ${filesToProcess.length} proposal(s) to build.\n`);
  } else {
    // Build most recently modified markdown file
    const files = findMarkdownFiles();
    if (files.length === 0) {
      console.log('No markdown files found in proposals directory.');
      console.log('\nUsage:');
      console.log('  npm run build              # Build most recent proposal');
      console.log('  npm run build:all          # Build all proposals');
      console.log('  npm run build <file.md>    # Build specific proposal');
      process.exit(0);
    }

    // Sort by modification time
    files.sort((a, b) => {
      return fs.statSync(b).mtime - fs.statSync(a).mtime;
    });

    filesToProcess = [files[0]];
    console.log(`Building most recent proposal: ${path.basename(files[0])}\n`);
  }

  // Process all files
  let successCount = 0;
  for (const file of filesToProcess) {
    const success = await processFile(file);
    if (success) successCount++;
  }

  console.log(`\n=== Build Complete: ${successCount}/${filesToProcess.length} successful ===`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  if (watchMode) {
    console.log('Watch mode not yet implemented. Use --all to rebuild all files.');
  }
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
