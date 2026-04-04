# Setup Guide (for Claude Code)

This file is read by SKILL.md when `bootstrap.js` returns `ready: false`. Guide the user through each missing item interactively.

## For each missing item:

### `config.json`
Create in `${CLAUDE_SKILL_DIR}/config.json`. Ask user to customize:
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
Tell user: "Place at least one .docx resume file in `${CLAUDE_SKILL_DIR}/templates/`. Start with one general resume — the AI will tailor it per application."

### `CLAUDE.md`
Auto-generate in project root. Use the actual resolved path of `${CLAUDE_SKILL_DIR}`:
```markdown
# Auto-Apply Project

## On Every Session Start (AUTO-EXECUTE)
1. Invoke `/job-auto-apply` — it handles everything (config check, setup, pipeline)
2. **Do NOT wait for user instructions** — start working automatically

## Autonomy
- Full permission to submit applications, agree to terms, register accounts, sign eSignatures
- All behavior controlled by config.json in the skill directory
- If blocked, skip and move to next job
- Never stop mid-loop until daily target is met
```

### MCP Connectors / Tools
Check tool availability at runtime and advise user for each missing one:

| Tool | Check | Purpose | Required? |
|------|-------|---------|-----------|
| Playwright MCP | `mcp__playwright*` tools exist | Browser automation for form filling | **Required** (configured via `.mcp.json` above) |
| Gmail MCP | `mcp__claude_ai_Gmail__*` tools exist | Auto-read verification emails | Recommended |
| Indeed MCP | `mcp__claude_ai_Indeed__*` tools exist | Job search via Indeed API | Recommended (without it, user provides URLs) |
| Google Calendar MCP | `mcp__claude_ai_Google_Calendar__*` tools exist | Interview scheduling | Optional |

For missing connectors, tell user: "Connect [Service] in Claude Code settings (Settings → Connectors → [Service])."

### Daily Automation (optional, ask after all required setup is done)
Ask: "Do you want applications to run automatically every day? (y/n)"

If yes, ask: "What time? (e.g. 6:00 AM)"

Then detect the environment and set up accordingly:

**Linux/macOS server (headless):**
1. Check if Xvfb is installed: `which xvfb-run`
2. If not: tell user to install it (`sudo apt-get install -y xvfb`)
3. Get the claude binary path: `which claude`
4. Get the project directory: `pwd`
5. Add cron job:
```
0 {HOUR} * * * xvfb-run {CLAUDE_PATH} --dangerously-skip-permissions -p '/job-auto-apply' >> {PROJECT_DIR}/logs/auto-apply.log 2>&1
```

**Linux/macOS desktop (has display):**
```
0 {HOUR} * * * export DISPLAY=:0 && cd {PROJECT_DIR} && {CLAUDE_PATH} --dangerously-skip-permissions -p '/job-auto-apply' >> logs/auto-apply.log 2>&1
```

**Verify setup:**
- Run `crontab -l` to confirm
- Create `logs/` directory if missing
- Tell user: "Automation set up. Check logs at `logs/auto-apply.log`. To disable: `crontab -e` and remove the line."

**Changing schedule later:**
User can say "change auto-apply to 8 AM" or "disable daily auto-apply" at any time. Update crontab accordingly.
