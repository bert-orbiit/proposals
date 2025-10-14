#!/usr/bin/env node

/**
 * Automates creation of submission tracking packages
 *
 * Usage:
 *   npm run submit proposals/client-sow.md
 *   node scripts/submit-proposal.js proposals/client-sow.md
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
}

function parseEmailList(emails) {
  return emails.split(',').map(e => e.trim()).filter(e => e);
}

function generateSubmissionRecord(data) {
  const record = `# Submission Record: ${data.clientName} ${data.opportunityName}

## Proposal Metadata

**Client:** ${data.clientName}
**Opportunity:** ${data.opportunityName}
**Total Value:** ${data.totalValue}
**Duration:** ${data.duration}
${data.phase3 ? `**Potential Phase 3:** ${data.phase3}` : ''}

---

## Submission Details

**Date Submitted:** ${data.submittedDate}
**Submitted By:** ${data.submittedBy}
**Method:** ${data.method}

### Primary Recipients
${data.recipients.map(r => `- ${r}`).join('\n')}

${data.cc.length > 0 ? `### CC Recipients
${data.cc.map(r => `- ${r}`).join('\n')}
` : ''}
${data.bcc.length > 0 ? `### BCC Recipients
${data.bcc.map(r => `- ${r}`).join('\n')}
` : ''}
### Email Subject
"${data.subject}"

---

## Email Summary

${data.emailSummary}

---

## Document Version

${data.proposalScore ? `**Proposal Score:** ${data.proposalScore}` : ''}
${data.analysisFile ? `**Analysis Document:** [${path.basename(data.analysisFile)}](${path.basename(data.analysisFile)})` : ''}
**Source Markdown:** [${path.basename(data.sourceFile)}](${path.basename(data.sourceFile)})
**PDF Delivered:** [${path.basename(data.pdfFile)}](${path.basename(data.pdfFile)})

---

## Follow-Up Tracking

**Status:** Awaiting Response

**Expected Timeline:**
${data.expectedTimeline || '- TBD'}

**Next Actions:**
- [ ] Response received
- [ ] Q&A call scheduled
- [ ] Negotiation/modifications requested
- [ ] Acceptance/signing
- [ ] Kickoff scheduled

---

## Notes

${data.notes || '_Add notes here as opportunity progresses_'}

---

## Files in This Package

1. **SUBMISSION_RECORD.md** (this file) - Complete submission metadata
2. **${path.basename(data.sourceFile)}** - Source Markdown (final version)
3. **${path.basename(data.pdfFile)}** - PDF delivered to client
${data.analysisFile ? `4. **${path.basename(data.analysisFile)}** - Strategic analysis` : ''}

---

**Package Created:** ${formatDateTime(new Date())}
**Repository:** ${process.cwd()}
**Git Branch:** main
`;

  return record;
}

async function main() {
  try {
    // Get proposal file from command line
    const proposalPath = process.argv[2];

    if (!proposalPath) {
      console.error('Usage: npm run submit <proposal-file.md>');
      console.error('Example: npm run submit proposals/trusspoint-sow.md');
      process.exit(1);
    }

    const fullPath = path.resolve(proposalPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: File not found: ${proposalPath}`);
      process.exit(1);
    }

    const baseName = path.basename(proposalPath, '.md');
    const pdfPath = path.join('output', `${baseName}.pdf`);
    const analysisPath = path.join('proposal_analysis', `${baseName}-analysis.md`);

    console.log('\n=== Proposal Submission Package Creator ===\n');
    console.log(`Proposal: ${proposalPath}`);
    console.log(`PDF: ${fs.existsSync(pdfPath) ? pdfPath : 'NOT FOUND - will skip'}`);
    console.log(`Analysis: ${fs.existsSync(analysisPath) ? analysisPath : 'NOT FOUND - will skip'}`);
    console.log('');

    // Collect metadata interactively
    const clientName = await prompt('Client name (e.g., TrussPoint): ');
    const dateStr = await prompt(`Submission date [${formatDate(new Date())}]: `) || formatDate(new Date());

    const packageDir = path.join('submitted', `${clientName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}`);

    if (fs.existsSync(packageDir)) {
      const overwrite = await prompt(`Package already exists: ${packageDir}\nOverwrite? (yes/no): `);
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    console.log('\n--- Email Details ---');
    const submittedDateTime = await prompt(`Date/time submitted (e.g., October 14, 2025, 4:35 PM): `);
    const submittedBy = await prompt('Submitted by (e.g., Bert Carroll <bert@askthehuman.com>): ');
    const method = await prompt('Method [Email]: ') || 'Email';
    const recipients = await prompt('Primary recipients (comma-separated): ');
    const cc = await prompt('CC recipients (comma-separated, optional): ');
    const bcc = await prompt('BCC recipients (comma-separated, optional): ');
    const subject = await prompt('Email subject: ');

    console.log('\n--- Opportunity Details ---');
    const opportunityName = await prompt('Opportunity name (e.g., Greenfield Market Intelligence): ');
    const totalValue = await prompt('Total value (e.g., $16,000): ');
    const duration = await prompt('Duration (e.g., ~8 weeks): ');
    const phase3 = await prompt('Potential Phase 3 (optional): ');

    console.log('\n--- Additional Details (Optional) ---');
    const proposalScore = await prompt('Proposal score (e.g., 9.2/10, optional): ');
    const expectedTimeline = await prompt('Expected response timeline (optional): ');
    const notes = await prompt('Initial notes (optional): ');

    const emailSummary = `**Positioning:**
- [Add key positioning points from email]

**Key Points:**
- [Add key points from email body]

**Next Steps Proposed:**
1. [Add next steps from email]`;

    // Build data object
    const data = {
      clientName,
      opportunityName,
      totalValue,
      duration,
      phase3,
      submittedDate: submittedDateTime,
      submittedBy,
      method,
      recipients: parseEmailList(recipients),
      cc: parseEmailList(cc),
      bcc: parseEmailList(bcc),
      subject,
      emailSummary,
      sourceFile: proposalPath,
      pdfFile: pdfPath,
      analysisFile: fs.existsSync(analysisPath) ? analysisPath : null,
      proposalScore: proposalScore || null,
      expectedTimeline: expectedTimeline || null,
      notes: notes || null
    };

    // If analysis file exists, try to extract score (if not manually provided)
    if (data.analysisFile && !data.proposalScore) {
      const analysisContent = fs.readFileSync(analysisPath, 'utf8');
      const scoreMatch = analysisContent.match(/Overall Score:\s*(\d+\.?\d*\/10)/);
      if (scoreMatch) {
        data.proposalScore = scoreMatch[1];
      }
    }

    // Create package directory
    fs.mkdirSync(packageDir, { recursive: true });

    // Copy files
    console.log(`\nCreating package: ${packageDir}/`);

    fs.copyFileSync(fullPath, path.join(packageDir, path.basename(fullPath)));
    console.log(`  ✓ Copied ${path.basename(fullPath)}`);

    if (fs.existsSync(pdfPath)) {
      fs.copyFileSync(pdfPath, path.join(packageDir, path.basename(pdfPath)));
      console.log(`  ✓ Copied ${path.basename(pdfPath)}`);
    } else {
      console.log(`  ⚠ Skipped PDF (not found)`);
    }

    if (data.analysisFile) {
      fs.copyFileSync(data.analysisFile, path.join(packageDir, path.basename(data.analysisFile)));
      console.log(`  ✓ Copied ${path.basename(data.analysisFile)}`);
    }

    // Generate SUBMISSION_RECORD.md
    const recordContent = generateSubmissionRecord(data);
    fs.writeFileSync(path.join(packageDir, 'SUBMISSION_RECORD.md'), recordContent);
    console.log(`  ✓ Generated SUBMISSION_RECORD.md`);

    console.log('\n=== Package Created Successfully ===');
    console.log(`Location: ${packageDir}/`);
    console.log('\nNext steps:');
    console.log(`1. Edit ${packageDir}/SUBMISSION_RECORD.md to fill in email summary`);
    console.log(`2. Update submitted/README.md Active Submissions table`);
    console.log('3. Commit to git:');
    console.log(`   git add ${packageDir}`);
    console.log(`   git commit -m "Submit proposal: ${clientName} - ${opportunityName}"`);

    rl.close();

  } catch (error) {
    console.error('\nError:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
