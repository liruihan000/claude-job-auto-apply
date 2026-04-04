# Claude Job Auto-Apply

**Fully autonomous job application agent powered by Claude Code subagent orchestration + Playwright.**

Searches jobs, tailors every resume to the JD, writes cover letters, fills any ATS form, auto-registers accounts, solves CAPTCHAs, handles email verification — and submits. All configurable. No limits.

> Tested: 30 applications across 7 ATS platforms in one session. Zero human intervention.

## Install

```bash
npx skills add liruihan000/claude-job-auto-apply
claude --dangerously-skip-permissions
```

Then type:
```
/job-auto-apply
```

First run guides you through setup. After that, it auto-starts on every session.

## Architecture

```
               Claude Opus (Main Agent)
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

## How It's Different

| | Traditional Bots | This Agent |
|---|---|---|
| Resume | One generic | Tailored per JD |
| ATS | LinkedIn Easy Apply only | 10+ platforms, self-expanding |
| Parallelism | Single-threaded | N browsers simultaneous |
| Errors | Crash and stop | Self-heal, log, continue |
| Learning | Static code | Accumulates ATS handlers |
| Automation | Manual trigger | Daily cron, fully unattended |

## License

MIT
