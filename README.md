# Auto-Apply: AI-Powered Job Application Pipeline

Fully automated job application system built as a [Claude Code](https://claude.ai/code) skill. Searches jobs, tailors resumes, generates cover letters, fills ATS forms, and submits applications — all autonomously.

## What It Does

```
Job URL/Search → ATS Detection → Resume Tailoring → Cover Letter → Form Fill → Submit → Track
```

- **ATS-aware form filling** — Platform-specific handlers for Workday, Greenhouse, Lever, iCIMS, SAP SuccessFactors, Indeed, LinkedIn, Taleo, Jobvite, Oracle, and more
- **Resume tailoring** — Generates a customized DOCX → PDF for each application based on JD keywords
- **Cover letter generation** — Targeted cover letters referencing specific company/role details
- **Batch mode** — Apply to multiple jobs in sequence with parallel browser instances
- **Smart field mapping** — Handles dropdowns, React controlled components, file uploads, screening questions
- **Application tracking** — Records every application with status, materials, and notes

## Quick Start

### 1. Clone

```bash
git clone https://github.com/liruihan000/auto_apply.git ~/Career
cd ~/Career
```

### 2. Set Up Your Profile

Copy the example files and fill in your info:

```bash
# User profile (experience, skills, education)
cp .claude/skills/auto-apply-v2/references/user-profile.example.md \
   .claude/skills/auto-apply-v2/references/user-profile.md

# Secrets (login credentials for ATS portals)
cp .claude/skills/auto-apply-v2/references/secrets.example.md \
   .claude/skills/auto-apply-v2/references/secrets.md

# Resume config example
cp .claude/skills/auto-apply-v2/references/configs/example_resume_config.json \
   .claude/skills/auto-apply-v2/references/configs/my_resume_config.json

# Application tracker
cp .claude/skills/auto-apply-v2/references/application-tracker.example.md \
   Basic/applications/TRACKER.md

# Create required directories
mkdir -p Basic/templates Basic/applications Basic/archive
```

Edit each file with your personal information.

### 3. Add Your Resume Templates

Place your resume templates (DOCX + PDF) in `Basic/templates/`:

```
Basic/templates/
├── general-swe.docx / .pdf
├── backend.docx / .pdf
├── fullstack-ai.docx / .pdf
└── ... (one per target role direction)
```

See `references/template-guide.md` for the template selection guide.

### 4. Configure Playwright MCP

Create `.mcp.json` in the project root:

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

For email verification during ATS registration, also add Gmail MCP so the agent can check your inbox automatically.

### 5. Run

```bash
cd ~/Career
claude
```

Then use:

```
/auto-apply-v2 <job-url>          # Apply to a specific job
/auto-apply-v2 search <keywords>  # Search and batch apply
```

Or just paste a job URL — the skill auto-triggers on job-related messages.

## Project Structure

```
.claude/skills/auto-apply-v2/
├── SKILL.md                          # Main skill definition
├── ats-handlers/                     # Platform-specific form-fill strategies
│   ├── workday.md                    #   React SPA, data-automation-id targeting
│   ├── greenhouse.md                 #   Custom dropdowns, single-page forms
│   ├── lever.md                      #   Traditional forms, simpler flow
│   ├── indeed.md                     #   Smart Apply overlay
│   └── ...                           #   + taleo, oracle, sap, jobvite, ashby, generic
├── references/
│   ├── user-profile.md               # YOUR info (gitignored, copy from .example)
│   ├── secrets.md                    # YOUR credentials (gitignored, copy from .example)
│   ├── template-guide.md             # Resume template selection guide
│   ├── configs/                      # Per-application resume configs (gitignored)
│   └── *.example.md                  # Templates to copy
├── scripts/
│   ├── create_resume.js              # DOCX resume generator
│   ├── create_cover_letter.js        # DOCX cover letter generator
│   └── detect_ats.js                 # ATS platform detection
Basic/
├── templates/                        # Your resume templates (gitignored)
└── applications/                     # Application records (gitignored)
    └── YYYY-MM-DD_Company_Role/
        ├── resume.pdf / .docx
        ├── cover_letter.pdf / .docx
        ├── notes.md
        └── STATUS.md
```

## ATS Platform Support

| Platform | Form Fill | File Upload | Notes |
|----------|-----------|-------------|-------|
| Workday | React-aware (onChange triggers) | ✅ | Multi-page wizard |
| Greenhouse | Standard + custom dropdowns | ✅ | Often single-page |
| Lever | Standard forms | ✅ | Simplest flow |
| Indeed Smart Apply | Overlay form | ✅ | 2-3 screens |
| LinkedIn Easy Apply | Modal multi-step | ✅ | |
| iCIMS | iFrame handling | ✅ | May need account |
| SAP SuccessFactors | Enterprise forms | ✅ | Always needs account |
| Taleo | Legacy forms + eSignature | ✅ | |
| Jobvite / Oracle / Ashby | Standard | ✅ | |
| Unknown platform | Generic (read all interactive elements) | ✅ | |

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- Node.js 18+ (for Playwright MCP and resume generation scripts)
- LibreOffice (for DOCX → PDF conversion): `sudo apt install libreoffice` or `brew install libreoffice`

## License

MIT
