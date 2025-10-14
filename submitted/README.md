# Submitted Proposals Tracking

This directory contains complete packages for all submitted proposals, organized by client and submission date.

## Directory Structure

```
submitted/
├── README.md (this file)
└── [client-name]-[YYYY-MM-DD]/
    ├── SUBMISSION_RECORD.md     # Complete submission metadata
    ├── [proposal].md            # Source Markdown
    ├── [proposal].pdf           # PDF delivered to client
    └── [proposal]-analysis.md   # Strategic analysis (optional)
```

## Submission Record Template

Each submission package includes a `SUBMISSION_RECORD.md` with:

1. **Proposal Metadata**
   - Client name
   - Opportunity description
   - Total value
   - Duration
   - Potential follow-on work

2. **Submission Details**
   - Date/time submitted
   - Submitted by (sender)
   - Method (email, portal, etc.)
   - Recipients (To, CC, BCC)
   - Email subject line

3. **Email Summary**
   - Key positioning points
   - Proposed next steps
   - Timeline/urgency notes

4. **Document Version**
   - Proposal score (if analyzed)
   - Git commit reference
   - Links to all files in package

5. **Strategic Elements**
   - Positioning summary
   - Commercial structure
   - Risk mitigation approach
   - Legal protections

6. **Follow-Up Tracking**
   - Current status
   - Expected timeline
   - Next actions checklist

7. **Competitive Context**
   - Win probability estimate
   - Competitive advantages
   - Primary risks
   - Mitigation strategy

## Active Submissions

| Client | Submitted | Value | Status | Next Action |
|--------|-----------|-------|--------|-------------|
| TrussPoint | 2025-10-14 | $16K | Awaiting Response | Monitor for reply |

## Usage

### Automated Submission Package Creation (Recommended)

Use the automated script to create submission packages:

```bash
npm run submit proposals/client-sow.md
```

The script will:

1. **Detect files automatically:**
   - Source markdown: `proposals/client-sow.md`
   - PDF: `output/client-sow.pdf` (if exists)
   - Analysis: `proposal_analysis/client-sow-analysis.md` (if exists)

2. **Prompt for metadata interactively:**
   - Client name → generates folder name automatically
   - Submission date (defaults to today)
   - Email details (to/cc/subject/date-time)
   - Opportunity details (name/value/duration/phase3)
   - Optional: Proposal score, expected timeline, notes

3. **Create complete package:**
   - `submitted/[client-name]-[YYYY-MM-DD]/`
   - Copies all files automatically
   - Generates `SUBMISSION_RECORD.md` with all metadata
   - Auto-extracts proposal score from analysis file (if exists)

4. **Post-script steps:**
   - Edit `SUBMISSION_RECORD.md` to fill in email summary section
   - Update **Active Submissions** table (above)
   - Commit to git as instructed by script output

**Example workflow:**

```bash
# 1. Build the proposal PDF
npm run build proposals/acme-sow.md

# 2. Create submission package (interactive prompts)
npm run submit proposals/acme-sow.md

# 3. Edit the generated SUBMISSION_RECORD.md to add email summary
# 4. Update Active Submissions table in this README
# 5. Commit as instructed
```

### Manual Submission Package Creation

If you prefer manual creation or the script fails:

1. **Create folder:**
   ```bash
   mkdir submitted/[client-name]-[YYYY-MM-DD]
   ```

2. **Copy final files:**
   ```bash
   cp proposals/[name].md submitted/[client-name]-[YYYY-MM-DD]/
   cp output/[name].pdf submitted/[client-name]-[YYYY-MM-DD]/
   cp proposal_analysis/[name]-analysis.md submitted/[client-name]-[YYYY-MM-DD]/ # if exists
   ```

3. **Create SUBMISSION_RECORD.md:**
   - Use [trusspoint-2025-10-14/SUBMISSION_RECORD.md](trusspoint-2025-10-14/SUBMISSION_RECORD.md) as template
   - Fill in all submission details from email
   - Include strategic context and follow-up tracking

4. **Update Active Submissions table** (above) with new entry

5. **Commit to git:**
   ```bash
   git add submitted/[client-name]-[YYYY-MM-DD]
   git commit -m "Submit proposal: [Client Name] - [Brief Description]"
   ```

### Updating Status

When status changes (response received, call scheduled, won/lost):

1. Update `SUBMISSION_RECORD.md` in the client folder
2. Check off completed next actions
3. Add notes on client feedback or objections
4. Update Active Submissions table
5. Commit changes

### Moving to Archive

When opportunity is closed (won or lost):

1. Update `SUBMISSION_RECORD.md` with final outcome
2. Add lessons learned section
3. Move from Active Submissions to Archive Submissions table (below)
4. Commit final state

## Archive Submissions

| Client | Submitted | Value | Outcome | Closed Date | Notes |
|--------|-----------|-------|---------|-------------|-------|
| _(none yet)_ | | | | | |

---

**Directory Created:** October 14, 2025
**Maintained By:** Bert Carroll (bert@askthehuman.com)
