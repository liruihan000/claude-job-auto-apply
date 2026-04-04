# I Built an AI Agent That Submits 30 Tailored Job Applications a Day — While I Sleep

Last week, I woke up to find 30 job applications submitted, each with a custom-tailored resume and cover letter, across 7 different ATS platforms — Oracle HCM, Workday, Greenhouse, Lever, Ashby, Siemens Careers, and Uber Careers.

I didn't touch my keyboard. A cron job triggered at 6 AM, and my AI agent did the rest.

Here's how I built it, and why I believe this is the most capable open-source job application agent architecture that exists today.

---

## The Architecture: Claude Code as an Orchestration Engine

Most auto-apply bots are glorified form fillers. They use Selenium to click through LinkedIn Easy Apply and call it a day.

I took a different approach: **treat Claude Code as a full autonomous agent runtime**, not just a chatbot.

The system has three decoupled layers:

```
Search Layer          Processing Layer        Submission Layer
(pluggable)           (AI core)               (parallel)

Indeed MCP     →      Resume Tailoring   →    Playwright-1
LinkedIn       →      Cover Letter Gen   →    Playwright-2
Any job board  →      Material Prep      →    Playwright-3
                      TRACKER mgmt            ...extensible
                           ↑
                      ATS Handlers
                   (Workday, Greenhouse,
                    Lever, Oracle HCM...)
```

**Search** is pluggable — adding a new job board is just adding a new MCP connector or scraping source. **Processing** is the AI core — Claude Opus analyzes each JD, selects the right resume template, and follows an 8-step tailoring checklist. **Submission** runs on parallel Playwright instances with persistent browser profiles.

The key insight: **each layer scales independently**. More job boards? Plug them in. More ATS platforms? Write a handler file. Faster throughput? Add more Playwright instances.

---

## Maximizing Claude Opus: Subagent Orchestration

Here's where it gets interesting. I'm not just using Claude to fill forms. I'm using **Claude Opus as an orchestration brain** that spawns and manages a fleet of specialized subagents.

The main agent:
1. Searches for jobs and filters candidates against my profile
2. Prepares up to 9 material-preparation subagents **in parallel** — each one reads the JD, selects a template, rewrites the summary, mirrors keywords, reorders experiences, and generates a cover letter
3. Launches 3 submission subagents **in parallel**, each bound to its own Playwright browser instance
4. Monitors completion, updates the tracker, and immediately dispatches the next batch

In a single session, the main agent orchestrated **over 30 subagents** — 9 for material prep, 20+ for submission — while managing a queue, handling failures, and keeping the tracker in sync.

This is what Opus is built for. Not answering questions — **making decisions, delegating work, and driving complex workflows to completion**.

---

## Self-Healing: The Agent Gets Smarter Every Run

Every other auto-apply tool breaks when it hits an unfamiliar form. My agent **fixes itself and remembers the fix**.

When a submission subagent encounters friction — a dropdown that doesn't respond to clicks, a hidden field, a multi-step verification — it reports back:

```
FRICTION: Siemens select2 dropdown not responding to click
→ Required jQuery append(new Option).trigger('change') workaround
```

The main agent writes this into an ATS handler file (`ats-handlers/siemens.md`). Next time any subagent encounters Siemens, it reads the handler first and applies the workaround immediately.

**The system never fails on the same problem twice.**

After one week of daily runs, my ATS handler directory has become a comprehensive playbook covering Oracle HCM, Workday, Greenhouse, Lever, Ashby, Taleo, SAP SuccessFactors, and more. This accumulated knowledge is the real moat — and it grows automatically with every application.

---

## Full Automation: Cron + Xvfb + Zero Human Intervention

The final piece: **true unattended operation**.

```bash
# Runs every day at 6 AM on a headless server
0 6 * * * xvfb-run claude --dangerously-skip-permissions -p '/job-auto-apply'
```

- `xvfb-run` provides a virtual display (no physical monitor needed)
- `--dangerously-skip-permissions` enables full autonomy
- Playwright persistent profiles retain all login sessions (Google SSO, Indeed, ATS portals)
- The agent reads `CLAUDE.md` on startup, checks today's count, and runs until the daily target is met

On April 4th, my agent submitted 30 applications in a single session:
- **7 ATS platforms** traversed (including complex multi-step Oracle HCM and Workday flows)
- **30 tailored resumes** — each with rewritten summaries, mirrored keywords, reordered experiences
- **30 cover letters** — each referencing specific company context and role requirements
- **3 Playwright instances** running in parallel, with automatic queue management
- **2 CAPTCHAs solved** autonomously (hCaptcha visual challenges)
- **1 password reset** handled mid-flow (Uber Careers — found reset link in Gmail via MCP)

Total human intervention: **zero**.

---

## What Makes This Different

| | Traditional Bots | This Agent |
|---|---|---|
| Resume | One generic resume for all | 8-step tailored per JD |
| Cover letter | None or generic | Custom per application |
| ATS support | LinkedIn Easy Apply only | 7+ platforms, growing |
| Parallelism | Single-threaded | 3 browsers simultaneous |
| Error handling | Crash and stop | Self-heal and log |
| Learning | Static code | Accumulates ATS handlers |
| Automation | Manual trigger | Daily cron, fully unattended |
| Architecture | Monolithic | Decoupled, pluggable layers |

---

## The Stack

- **AI**: Claude Opus 4.6 (1M context) — orchestration, resume tailoring, form filling decisions
- **Runtime**: Claude Code CLI with skill system and subagent spawning
- **Browser**: Playwright MCP (3 parallel instances with persistent profiles)
- **Job Search**: Indeed MCP
- **Email**: Gmail MCP (for verification codes)
- **Scheduling**: System cron + Xvfb
- **ATS Intelligence**: Self-accumulating handler files

---

## Open Source

The full system is open source:

**GitHub: https://github.com/liruihan000/claude-job-auto-apply**

Clone it, fill in your profile, add your resume templates, and run `claude`. The agent handles the rest.

If you're job hunting in 2026, you shouldn't be filling out the same forms by hand 30 times a day. Let an agent do it — and let it get better at it every single day.

---

*Built by Ruihan (Ryan) Li — Software Engineer, AI enthusiast, and someone who would rather build systems than fill forms.*

*If you found this interesting, connect with me or star the repo. I'm actively looking for AI/Full-Stack engineering roles in NYC/NJ/Remote.*
