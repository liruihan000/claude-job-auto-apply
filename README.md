# Claude Job Auto-Apply

**Fully autonomous job application agent powered by Claude Code subagent orchestration + Playwright.**

Searches jobs, tailors every resume to the JD, writes cover letters, fills any ATS form, auto-registers accounts, solves CAPTCHAs, handles email verification — and submits. All configurable. No limits.

> Tested: 30 applications across 7 ATS platforms in one session. Zero human intervention.

## Install

```bash
# 1. Install Claude Code
curl -fsSL https://claude.ai/install.sh | bash  # or: npm install -g @anthropic-ai/claude-code

# 2. Install the skill
npx skills add liruihan000/claude-job-auto-apply

# 3. Run
claude --dangerously-skip-permissions
```

Then type `/job-auto-apply`. First run guides you through setup. After that, it auto-starts on every session.

## What Happens on First Run

The agent walks you through setup interactively:

1. **config.json** — asks your target roles, locations, daily goal, parallel browser count
2. **.mcp.json** — generates Playwright browser config (you choose how many instances)
3. **user-profile.md** — copies a template for your experience, skills, contact info
4. **secrets.md** — copies a template for ATS login credentials
5. **templates/** — asks you to add at least one `.docx` resume
6. **MCP connectors** — checks for Gmail/Indeed, guides you to connect if missing
7. **CLAUDE.md** — auto-generates so the agent starts automatically next session
8. **Daily cron** *(optional)* — sets up fully unattended daily runs

All user files are created in your project root, not inside the skill directory.

## Key Files

| File | Where | What |
|------|-------|------|
| `config.json` | Project root | Your settings (daily target, search keywords, parallelism) |
| `user-profile.md` | Project root | Your experience, skills, education, contact info |
| `secrets.md` | Project root | ATS login credentials |
| `templates/` | Project root | Your resume `.docx` files |
| `applications/` | Project root | Generated per application (resume, CL, notes, status) |
| `applications/TRACKER.md` | Project root | Single source of truth for all applications |
| `CLAUDE.md` | Project root | Auto-generated — makes skill run on every session start |

## Architecture

```
               Claude Code (Main Agent)
              Orchestration · Queue · Decisions
                    │         │         │
            ┌───────┘         │         └───────┐
     Search Layer        AI Core         Submit Layer
      (pluggable)        (fixed)          (parallel)
            │                │                │
     Indeed MCP         8-Step Resume    Playwright-1
     LinkedIn           Tailoring        Playwright-2
     ...any board       + Cover Letter   Playwright-3
                              │          ...extensible
                       ATS Handlers
                      (self-healing)
```

**Three decoupled layers.** Search is pluggable — add any job board via MCP. Submit is parallel — add more Playwright instances for more throughput. ATS handlers self-heal — every friction encountered becomes a permanent fix.

### Subagent Orchestration

The main agent spawns **30+ specialized subagents per session** — material prep in parallel, form submission in parallel, queue management, failure handling, all autonomous.

### Self-Healing

```
FRICTION: Siemens select2 dropdown not responding
→ jQuery workaround written to ats-handlers/siemens.md
→ Never fails on same problem twice
```

## ATS Support

Indeed, Workday, Oracle HCM, Greenhouse, Lever, Ashby, Taleo, SAP SuccessFactors, Siemens, Uber, Jobvite + generic fallback. **Grows automatically** with every new platform encountered.

## Why This Skill is Different

No other open-source job application tool has all of these:

- **Subagent parallelism** — Claude Code spawns N independent agents, each with its own browser. Not multitab — true parallel execution. No other agent framework can do this.
- **10+ ATS platforms with battle-tested handlers** — Workday, Oracle HCM, Greenhouse, Lever, Ashby, Taleo, SAP, and more. Each handler written from real-world friction, not theory.
- **Config-driven three-layer architecture** — Search, Prepare, Submit are fully decoupled. Change any layer via `config.json` without touching the skill logic.
- **Self-healing** — Every ATS failure becomes a permanent handler. The system literally gets smarter with every application.
- **Full automation** — Daily cron + Xvfb + persistent browser profiles. Runs on a headless server while you sleep.
- **ATS-optimized resume tailoring** — 10-step checklist with keyword matching, action verb alignment, ATS compatibility scoring. Not just keyword stuffing — structural optimization.


## License

MIT
