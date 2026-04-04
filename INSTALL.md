# Installation & Usage Guide

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed and authenticated
- Node.js 18+ (`node --version`)
- LibreOffice (for DOCX → PDF conversion)
  - Ubuntu/Debian: `sudo apt install libreoffice`
  - macOS: `brew install libreoffice`
  - Windows: download from [libreoffice.org](https://www.libreoffice.org/)

## Step 1: Clone

```bash
git clone https://github.com/liruihan000/auto_apply.git ~/Career
cd ~/Career
```

## Step 2: Create Your Config Files

Copy the example files:

```bash
# User profile — your experience, skills, education, contact info
cp .claude/skills/auto-apply-v2/references/user-profile.example.md \
   .claude/skills/auto-apply-v2/references/user-profile.md

# Secrets — ATS portal login credentials
cp .claude/skills/auto-apply-v2/references/secrets.example.md \
   .claude/skills/auto-apply-v2/references/secrets.md

# Application tracker
cp .claude/skills/auto-apply-v2/references/application-tracker.example.md \
   Basic/applications/TRACKER.md

# Create required directories
mkdir -p Basic/templates Basic/applications
```

## Step 3: Fill In Your Profile

### `references/user-profile.md`

This is the most important file. The AI uses it to tailor resumes and fill forms.

Include:
- **Contact info** — name, email, phone, address, LinkedIn, GitHub
- **Work authorization** — visa status, sponsorship needs
- **Experience pool** — all your jobs with multiple bullet variants per role
- **Projects** — key projects with tech stack and metrics
- **Education** — degrees, schools, dates
- **EEO defaults** — gender, race, veteran, disability (for form auto-fill)
- **Tailoring checklist** — rules for how AI should customize your resume

**Tip:** Write more bullets than you need per role. The AI will cherry-pick the most relevant ones for each application.

### `references/secrets.md`

Login credentials for ATS portals:
- Email/username and default password for auto-registration
- Preferred login method (Google Sign-In, manual, etc.)

**This file is gitignored and never committed.**

## Step 4: Add Resume Templates

Place your resume files in `Basic/templates/`. Each direction needs a DOCX + PDF pair:

```bash
Basic/templates/
├── general-swe.docx        # General software engineer
├── general-swe.pdf
├── backend.docx             # Backend / distributed systems
├── backend.pdf
├── fullstack-ai.docx        # Full-stack + AI
├── fullstack-ai.pdf
├── ai-ml-infra.docx         # AI/ML infrastructure
├── ai-ml-infra.pdf
├── platform-infra.docx      # Platform / DevOps / SRE
├── platform-infra.pdf
└── ... (add more as needed)
```

Update `references/template-guide.md` if you add new templates, so the AI knows when to use each one.

**Don't have multiple templates yet?** Start with one general resume — the AI will still tailor it per application.

## Step 5: Configure Playwright MCP

Create `.mcp.json` in the project root:

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

### Optional: Multiple Browser Instances (for parallel apply)

For batch mode with 3 parallel browsers:

```json
{
  "playwright-1": {
    "command": "npx",
    "args": ["@playwright/mcp@latest", "--profile-dir", "~/.playwright/profile-1"]
  },
  "playwright-2": {
    "command": "npx",
    "args": ["@playwright/mcp@latest", "--profile-dir", "~/.playwright/profile-2"]
  },
  "playwright-3": {
    "command": "npx",
    "args": ["@playwright/mcp@latest", "--profile-dir", "~/.playwright/profile-3"]
  }
}
```

### Optional: Gmail MCP (for email verification)

If ATS portals send verification emails during registration, add Gmail MCP so the agent can check your inbox:

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

Connect Gmail MCP through Claude Code's built-in connector settings.

## Step 6: Headless Server Setup (for servers without a monitor)

If running on a headless server (no physical display), install Xvfb to provide a virtual display for Playwright:

```bash
sudo apt-get install -y xvfb
```

This lets Playwright open browser windows in a virtual framebuffer instead of a real screen.

## Step 7: Daily Auto-Run (Cron)

Set up a cron job to automatically run the auto-apply pipeline every day:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 6:00 AM local time):
0 6 * * * xvfb-run /path/to/claude --dangerously-skip-permissions -p '/auto-apply-v2' >> ~/Career/logs/auto-apply.log 2>&1
```

Create the logs directory:
```bash
mkdir -p ~/Career/logs
```

**How it works:**
- `xvfb-run` — creates a temporary virtual display, then destroys it when done
- `--dangerously-skip-permissions` — skips all tool confirmation prompts (fully autonomous)
- `-p '/auto-apply-v2'` — passes the skill as the initial prompt
- Logs output to `~/Career/logs/auto-apply.log`

**Requirements:**
- Server must be powered on at the scheduled time
- Xvfb installed (`sudo apt-get install -y xvfb`)
- Claude Code CLI authenticated (`claude` command works)
- Playwright persistent profiles at `~/.playwright/profile-{1,2,3}/`

**Useful commands:**
```bash
# View current cron schedule
crontab -l

# Watch logs in real time
tail -f ~/Career/logs/auto-apply.log

# Test run manually
xvfb-run claude --dangerously-skip-permissions -p '/auto-apply-v2'

# Remove the cron job
crontab -r
```

**Note:** Playwright uses persistent browser profiles (`~/.playwright/profile-{1,2,3}/`) that retain cookies and login sessions across runs. Once you log into Google/Indeed/ATS portals in the first session, subsequent cron runs will reuse those sessions without re-authentication.

## Step 8: Install Script Dependencies

```bash
cd .claude/skills/auto-apply-v2/scripts
npm install docx
```

## Step 7: Run

```bash
cd ~/Career
claude
```

---

## Usage

### Apply to a Single Job

```
/auto-apply-v2 https://jobs.lever.co/company/position-id
```

Or just paste a job URL — the skill auto-triggers on job-related messages.

### Batch Search & Apply

```
/auto-apply-v2 search AI Engineer New York
```

The agent will:
1. Search Indeed/LinkedIn for matching jobs
2. Filter by your criteria (level, sponsorship, skills match)
3. Tailor resume + cover letter for each
4. Fill and submit forms
5. Track everything in `TRACKER.md`

### Check Status

Look at `Basic/applications/TRACKER.md` or ask:

```
How many applications did I submit today?
```

### Score a Job (Without Applying)

```
Score this job for me: https://...
```

### Interview Prep

```
Prepare me for the interview at [Company Name]
```

The agent reads your application materials and generates technical questions, behavioral STAR responses, and talking points.

---

## How It Works

```
                    ┌─────────────────────┐
                    │     Job URL/Search   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   ATS Detection      │
                    │   (URL + DOM check)  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼──────┐
    │ Select Template │ │ Read Profile │ │ Read Secrets│
    │ (template-guide)│ │(user-profile)│ │ (secrets)   │
    └─────────┬──────┘ └──────┬───────┘ └──────┬──────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Tailor Resume       │
                    │  (create_resume.js)  │
                    │  DOCX → PDF          │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Generate Cover Ltr  │
                    │(create_cover_letter) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Fill ATS Form       │
                    │  (ats-handlers/*.md) │
                    │  Playwright MCP      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Submit + Screenshot │
                    │  Track in TRACKER.md │
                    └─────────────────────┘
```

---

## File Reference

| File | Purpose | Gitignored? |
|------|---------|-------------|
| `SKILL.md` | Main skill definition — pipeline, rules, prompts | No |
| `ats-handlers/*.md` | Platform-specific form-fill strategies | No |
| `scripts/create_resume.js` | DOCX resume generator | No |
| `scripts/create_cover_letter.js` | DOCX cover letter generator | No |
| `scripts/detect_ats.js` | ATS platform detection script | No |
| `references/template-guide.md` | Which template to use for which role | No |
| `references/user-profile.md` | **Your** experience, skills, contact | **Yes** |
| `references/secrets.md` | **Your** login credentials | **Yes** |
| `references/configs/*.json` | Per-application resume configs | **Yes** |
| `Basic/templates/` | **Your** resume templates (DOCX+PDF) | **Yes** |
| `Basic/applications/` | **Your** application records | **Yes** |
| `CLAUDE.md` | Claude Code session instructions | No |

---

## Troubleshooting

### "SKILL.md not found"
Make sure you're running `claude` from the project root (`~/Career`), not a subdirectory.

### "Cannot read user-profile.md"
You haven't created it yet. Copy from the example:
```bash
cp .claude/skills/auto-apply-v2/references/user-profile.example.md \
   .claude/skills/auto-apply-v2/references/user-profile.md
```

### Playwright tools not available
Check `.mcp.json` exists in the project root and restart Claude Code.

### Resume PDF not generating
Make sure LibreOffice is installed:
```bash
soffice --version
```

### Form fill not working on Workday
Workday uses React controlled components. The agent will try `form_input` first, then fall back to click → clear → type → Tab. Check `ats-handlers/workday.md` for details.

### ATS requires login but agent can't log in
Log in manually in the browser first, then tell the agent to continue. Persistent browser profiles (via `--profile-dir`) will keep you logged in across sessions.

### Cron job runs but Playwright crashes with "cannot open display"
Install Xvfb and use `xvfb-run` in your crontab. See Step 6.

### Cron job doesn't seem to run
Check that the cron daemon is running: `systemctl status cron`. Verify your crontab: `crontab -l`. Check logs: `tail ~/Career/logs/auto-apply.log`.

### Login sessions expired between cron runs
Playwright persistent profiles keep cookies, but some ATS platforms expire sessions after days/weeks. The agent will auto-re-login using credentials from `secrets.md`. If Google Sign-In is configured, it typically persists for weeks.
