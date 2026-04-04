# Setup Guide (for Claude Code)

This file is read by SKILL.md when `bootstrap.js` returns `ready: false`. Guide the user through each missing item interactively.

## For each missing item:

### `config.json`
Create in project root with defaults. Ask user to customize:
```json
{
  "daily_target": 30,
  "job_search": {
    "keywords": ["Software Engineer", "AI Engineer"],
    "locations": ["Remote"],
    "job_type": "fulltime",
    "max_age_days": 7
  },
  "browser": { "parallel_instances": 3 },
  "automation": {
    "skip_on_no_sponsorship": true,
    "skip_on_citizenship_required": true,
    "auto_agree_terms": true,
    "auto_register_accounts": true,
    "auto_sign_esignatures": true
  }
}
```
Ask: "What job titles are you targeting?" → update keywords.
Ask: "What locations?" → update locations.
Ask: "How many applications per day?" → update daily_target.

### `.mcp.json`
Ask: "How many parallel browser instances? (1-10, recommended: 3)"
Generate based on answer N:
```json
{
  "mcpServers": {
    "playwright-{i}": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--profile-dir", "~/.playwright/profile-{i}"]
    }
  }
}
```
If N=1, use key `"playwright"` instead of `"playwright-1"`.
If user has existing `.mcp.json`, merge — don't overwrite.
After creating, tell user: **"Please restart Claude Code for browser instances to load, then run /job-auto-apply again."**

### `user-profile.md`
Copy from `references/user-profile.example.md`.
Tell user: "Please fill in your experience, skills, education, and contact info in this file. This is the most important file — the AI uses it to tailor every resume."

### `secrets.md`
Copy from `references/secrets.example.md`.
Tell user: "Fill in your email and default password for ATS portals. Prefer Google Sign-In if possible."

### Resume templates
Tell user: "Place at least one .docx resume file in Basic/templates/. Start with one general resume — the AI will tailor it per application."

### `CLAUDE.md`
Auto-generate in project root:
```markdown
# Auto-Apply Project

## On Every Session Start (AUTO-EXECUTE)
1. Run `node .claude/skills/job-auto-apply/scripts/bootstrap.js` to check config
2. If ready: read TRACKER.md, count today's submissions, invoke `/job-auto-apply` if below target
3. If not ready: read `.claude/skills/job-auto-apply/SETUP.md` and guide user through setup
4. **Do NOT wait for user instructions** — start working automatically

## Autonomy
- Full permission to submit applications, agree to terms, register accounts, sign eSignatures
- If blocked, skip and move to next job
- Never stop mid-loop until daily target is met

## Key References
- Config: `config.json`
- Skill: `.claude/skills/job-auto-apply/SKILL.md`
- User profile: `.claude/skills/job-auto-apply/references/user-profile.md`
- Tracker: `Basic/applications/TRACKER.md`
```

### MCP Connectors (warnings)
Check tool availability and advise:
- **Gmail MCP**: "Connect Gmail in Claude Code settings for auto email verification. Optional but recommended."
- **Indeed MCP**: "Connect Indeed in Claude Code settings for job search. Without it, provide job URLs manually."
