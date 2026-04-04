# Claude Job Auto-Apply

**AI agent that submits 30+ tailored job applications per day — fully autonomously.**

Built on [Claude Code](https://claude.ai/code), this system searches for jobs, tailors resumes per JD, generates cover letters, fills ATS forms across 10+ platforms, and submits — all while you sleep.

> On April 4, 2026, this agent submitted **30 applications across 7 ATS platforms** with zero human intervention. Each resume was individually tailored. Two CAPTCHAs were solved. One password was reset mid-flow via Gmail.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Claude Opus (Main Agent)                     │
│                   Orchestration · Decisions · Queue                  │
└──────────┬──────────────────┬──────────────────┬────────────────────┘
           │                  │                  │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ Search Layer │   │  AI Core    │   │ Submit Layer │
    │  (pluggable) │   │  (fixed)    │   │  (parallel)  │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                  │                  │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ Indeed MCP   │   │ 8-Step      │   │Playwright-1 │
    │ LinkedIn     │   │ Resume      │   │Playwright-2 │
    │ Glassdoor    │   │ Tailoring   │   │Playwright-3 │
    │ ...any board │   │ + Cover Ltr │   │...extensible│
    └─────────────┘   └──────┬──────┘   └─────────────┘
                             │
                      ┌──────▼──────┐
                      │ ATS Handlers │
                      │ (self-healing)│
                      └─────────────┘
```

**Three decoupled layers, each scales independently:**

- **Search** — Pluggable job sources. Adding a new board = adding an MCP connector. Zero code changes.
- **AI Core** — Claude Opus tailors every resume (8-step checklist), generates cover letters, and manages the application tracker.
- **Submit** — Parallel Playwright instances with persistent browser profiles. Add more instances for more throughput.

### Subagent Orchestration

The main agent doesn't fill forms itself. It spawns **specialized subagents**:

- **Material prep subagents** (up to 9 parallel) — Each reads a JD, selects a template, tailors resume, writes cover letter
- **Submit subagents** (3 parallel) — Each bound to its own Playwright browser, fills forms and submits
- **Main agent** — Manages the queue, updates tracker, dispatches next batch

In a single session, the main agent orchestrated **30+ subagents** while handling failures, retries, and tracker updates.

### Self-Healing ATS Handlers

When a subagent encounters friction (broken dropdown, hidden field, multi-step verification), it reports back:

```
FRICTION: Siemens select2 dropdown not responding
→ jQuery append(new Option).trigger('change') workaround
```

The main agent writes this into `ats-handlers/siemens.md`. **Next time, any subagent reads the handler first and skips the problem entirely.** The system gets smarter with every application.

### Full Automation

```bash
# Runs every day at 6 AM — zero human intervention
0 6 * * * xvfb-run claude --dangerously-skip-permissions -p '/auto-apply-v2'
```

Xvfb provides a virtual display for headless servers. Persistent browser profiles retain all login sessions.

---

## Quick Start

### 1. Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed and authenticated
- Node.js 18+

### 2. Clone & Configure

```bash
git clone https://github.com/liruihan000/claude-job-auto-apply.git ~/Career
cd ~/Career

# Create your personal config files (from examples)
cp .claude/skills/auto-apply-v2/references/user-profile.example.md \
   .claude/skills/auto-apply-v2/references/user-profile.md

cp .claude/skills/auto-apply-v2/references/secrets.example.md \
   .claude/skills/auto-apply-v2/references/secrets.md

cp Basic/applications/TRACKER.example.md \
   Basic/applications/TRACKER.md
```

Edit `user-profile.md` with your experience, skills, and contact info.
Edit `secrets.md` with your ATS login credentials.

### 3. Add Resume Templates

Place your `.docx` resume files in `Basic/templates/`. Start with one general resume — the AI tailors it per application.

### 4. Configure Playwright MCP

Create `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "playwright-1": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-playwright", "--profile-dir", "~/.playwright/profile-1"]
    },
    "playwright-2": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-playwright", "--profile-dir", "~/.playwright/profile-2"]
    },
    "playwright-3": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-playwright", "--profile-dir", "~/.playwright/profile-3"]
    }
  }
}
```

### 5. Run

```bash
claude
```

The agent reads `CLAUDE.md`, checks today's progress, and starts applying automatically. Or invoke the skill directly:

```
/auto-apply-v2
```

### 6. (Optional) Daily Cron for Headless Servers

```bash
sudo apt-get install -y xvfb

# Add to crontab (crontab -e):
0 6 * * * xvfb-run /path/to/claude --dangerously-skip-permissions -p '/auto-apply-v2' >> ~/Career/logs/auto-apply.log 2>&1
```

See [INSTALL.md](INSTALL.md) for the full setup guide.

---

## Project Structure

```
claude-job-auto-apply/
├── CLAUDE.md                              # Agent instructions (auto-read on startup)
├── INSTALL.md                             # Detailed setup guide
├── .mcp.json                              # Playwright MCP config
│
├── .claude/skills/auto-apply-v2/
│   ├── SKILL.md                           # Core pipeline logic
│   ├── ats-handlers/                      # Self-healing ATS strategies
│   │   ├── workday.md                     #   React SPA, data-automation-id
│   │   ├── greenhouse.md                  #   Custom dropdowns
│   │   ├── oracle.md                      #   Oracle HCM Cloud
│   │   ├── lever.md, indeed.md, ...       #   10+ platforms
│   │   └── generic.md                     #   Fallback for unknown ATS
│   ├── references/
│   │   ├── user-profile.example.md        # ← Copy and fill with your info
│   │   ├── secrets.example.md             # ← Copy and fill with credentials
│   │   └── template-guide.md              # Resume template selection rules
│   └── scripts/
│       ├── create_resume.js               # DOCX resume generator
│       └── create_cover_letter.js         # DOCX cover letter generator
│
├── Basic/
│   ├── templates/                         # Your resume .docx files
│   └── applications/                      # Generated per application:
│       ├── TRACKER.md                     #   Single source of truth
│       └── YYYY-MM-DD_Company_Role/
│           ├── resume.md / .docx          #   Tailored resume
│           ├── cover_letter.md / .docx    #   Tailored cover letter
│           ├── notes.md                   #   Tailoring decisions
│           ├── STATUS.md                  #   ⬜/✅/❌ status
│           ├── review-screenshot.png      #   Pre-submit screenshot
│           └── confirmation-screenshot.png #   Post-submit proof
│
└── logs/                                  # Cron execution logs
```

## ATS Platform Support

| Platform | Status | Method |
|----------|--------|--------|
| Indeed Smart Apply | ✅ | Indeed MCP + Playwright |
| Workday | ✅ | React-aware form fill |
| Oracle HCM | ✅ | Multi-step wizard + email verification |
| Greenhouse | ✅ | Standard forms |
| Lever | ✅ | Simple forms |
| Ashby | ✅ | Standard forms |
| Taleo | ✅ | Legacy forms + eSignature |
| SAP SuccessFactors | ✅ | Enterprise forms |
| Siemens Careers | ✅ | Select2 workaround |
| Uber Careers | ✅ | GraphQL submission |
| Jobvite | ✅ | Standard forms |
| Unknown | ✅ | Generic handler (auto-detect) |

Handlers accumulate automatically. Every new platform the agent encounters becomes a permanent handler.

## How It's Different

| | Traditional Bots | This Agent |
|---|---|---|
| Resume | One generic for all | Tailored per JD (8-step checklist) |
| Cover letter | None or generic | Custom per application |
| ATS support | LinkedIn Easy Apply only | 10+ platforms, self-expanding |
| Parallelism | Single-threaded | 3+ browsers simultaneous |
| Error handling | Crash and stop | Self-heal, log, continue |
| Learning | Static code | Accumulates ATS handlers |
| Automation | Manual trigger | Daily cron, fully unattended |
| Architecture | Monolithic | Decoupled, pluggable layers |

## Tech Stack

- **AI**: Claude Opus / Sonnet (orchestration, tailoring, form-fill decisions)
- **Runtime**: Claude Code CLI + skill system + subagent spawning
- **Browser**: Playwright MCP (3 parallel instances, persistent profiles)
- **Job Search**: Indeed MCP (extensible to any source)
- **Email**: Gmail MCP (verification codes)
- **Scheduling**: System cron + Xvfb (headless servers)

## License

MIT
