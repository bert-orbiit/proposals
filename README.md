# Proposals & Professional Documents

Repository for business proposals, client engagements, and professional materials.

## Purpose

This repository serves two main functions:

1. **Proposal System** - Automated proposal generation for consulting clients
2. **Professional Documents** - Resume and supporting materials often requested alongside proposals

## Structure

```
proposals/
├── proposals/          # Active proposal templates and drafts
├── submitted/          # Completed proposals with submission records
├── resumes/           # Professional resume materials
├── templates/         # Proposal templates and components
├── scripts/           # Automation scripts for proposal generation
├── assets/            # Images, CSS, and other static files
└── output/            # Generated proposal PDFs
```

## Quick Start

### For Proposals

**Create a new proposal:**
```bash
npm run create-proposal
```

**Generate PDF:**
```bash
npm run generate-pdf <proposal-name>
```

### For Resume

Resume materials are in the `/resumes` folder. See [resumes/README.md](resumes/README.md) for details.

**Quick access:**
- Executive Resume (2-page): `resumes/Robert _Bert_ Carroll - Resume.pdf`
- Comprehensive Resume (6-8 page): `resumes/Robert _Bert_ Carroll - Comprehensive Resume.pdf`

## Workflow

1. **Draft Proposal** - Create in `/proposals` using templates
2. **Generate** - Run scripts to create PDF with branding
3. **Submit** - Move to `/submitted` with tracking record
4. **Include Resume** - Often requested with proposals (in `/resumes`)

## Recent Submissions

- **TrussPoint (2025-10-14)** - Software consulting services for payment processing platform

## Tech Stack

- Node.js + Puppeteer for PDF generation
- Mermaid for diagrams
- Markdown for content
- Custom CSS for branding

## Contact

**Bert Carroll**
CTO | AI-Native Development | Accelerating Humans
bert.carroll@gmail.com | [bertcarroll.ai](https://bertcarroll.ai)
