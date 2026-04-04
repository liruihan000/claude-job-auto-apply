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
0 6 * * * xvfb-run claude --dangerously-skip-permissions -p '/job-auto-apply'
```

Xvfb provides a virtual display for headless servers. Persistent browser profiles retain all login sessions.

---

## Quick Start

### 1. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Or see [claude.ai/code](https://claude.ai/code) for other install methods (Desktop app, VS Code extension, etc.)

### 2. Install the skill

```bash
npx skills add liruihan000/claude-job-auto-apply
```

Or manually:
```bash
git clone https://github.com/liruihan000/claude-job-auto-apply.git ~/.claude/skills/job-auto-apply
```

### 3. Run

```bash
claude --dangerously-skip-permissions
```

That's it. The agent detects missing configs on first launch and **interactively guides you through setup** — Playwright browsers, your profile, credentials, resume templates, MCP connectors, and daily cron schedule.

---

## Project Structure

```
job-auto-apply/                            # repo = skill
├── SKILL.md                               # Core pipeline logic
├── SETUP.md                               # Bootstrap setup guide (read by agent)
├── README.md                              # This file
├── ats-handlers/                          # Self-healing ATS strategies (11+ platforms)
│   ├── workday.md, greenhouse.md, oracle.md, lever.md, indeed.md, ...
│   └── generic.md                         #   Fallback for unknown ATS
├── references/
│   ├── user-profile.example.md            # ← Template for your info
│   ├── secrets.example.md                 # ← Template for credentials
│   └── template-guide.md                  # Resume template selection rules
├── scripts/
│   ├── bootstrap.js                       # Config detection + setup check
│   ├── create_resume.js                   # DOCX resume generator
│   └── create_cover_letter.js             # DOCX cover letter generator
│
│  — Auto-generated at runtime (gitignored) —
├── config.json                            # Your settings
├── templates/                             # Your resume .docx files
├── applications/                          # Per-application records
│   ├── TRACKER.md
│   └── YYYY-MM-DD_Company_Role/
└── logs/
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
