# Setup Guide (for Claude Code)

This file is read by SKILL.md when `bootstrap.js` returns `ready: false`.

## Setup Rules

- **One step at a time.** Ask one question, wait for answer, then next question. Never dump all questions at once.
- **Simple direct questions.** Ask "Your LinkedIn URL?" not a multi-choice menu. Never give numbered options for free-text inputs.
- **Match user's language.** If they write in Chinese, respond in Chinese.
- **Write files immediately** after getting each answer. Don't wait until the end.
- **Confirm each step** before moving on: "Done. Next: ..."
- Follow the order below — each step may depend on the previous one.

## Steps (in order):

### `config.json`
Create in **project root** `./config.json`. Ask user to customize:
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
Ask: "How many parallel browsers do you want? (1-10, recommended: 3)

This controls how many job applications are submitted at the same time. Each browser is an independent window that fills and submits one application. 3 browsers = 3 applications submitted simultaneously. More = faster, but uses more memory."
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
**Writing `.mcp.json`:** Try Bash first, fall back to manual if blocked.

Step 1: Attempt to write via Bash tool:
```bash
cat > .mcp.json << 'EOF'
{generated JSON}
EOF
```

Step 2: If Bash write succeeds, verify with `cat .mcp.json` and continue.

Step 3: If Bash write is blocked, THEN fall back — output the JSON and tell user:
"Create `.mcp.json` in your project root. Run this in your terminal:"
```bash
cat > .mcp.json << 'EOF'
{generated JSON}
EOF
```

Alternative for N=1: `/plugin install playwright` (no `.mcp.json` needed).

If user has existing `.mcp.json`, show how to merge playwright entries.

After creating, tell user: **"Please restart Claude Code for browser instances to load, then run /job-auto-apply again."**

### Resume templates (ask BEFORE user-profile)
Tell user: "Place at least one resume file (.docx or .pdf) in `./templates/`."

If user has added a template, read it immediately — extract all available info:
- Name, contact, location, links
- Work experience (companies, titles, dates, bullets)
- Education (schools, degrees, dates)
- Skills
- Projects

### `user-profile.md`
Copy from `${CLAUDE_SKILL_DIR}/references/user-profile.example.md` to **project root** `./user-profile.md`.

**Auto-fill from resume:** If a resume template was provided above, automatically populate user-profile.md with all extracted info. Fill in every field that can be derived from the resume.

**Then ask user to fill gaps:** After auto-fill, check what's still missing and ask:
- Contact info not in resume? (phone, email, LinkedIn, GitHub)
- Work authorization / visa status?
- EEO defaults? (gender, race, veteran, disability)
- Additional bullet variants per role? ("Want to add more bullet options for [Role]?")
- Any roles or projects not on the resume?

Write answers directly into user-profile.md — user should not need to edit the file manually.

### `secrets.md`
Copy from `${CLAUDE_SKILL_DIR}/references/secrets.example.md` to **project root** `./secrets.md`.
Ask user directly:
- "What email do you use for job portal accounts?"
- "Default password for auto-registration?" 
- "Prefer Google Sign-In when available?"
Write answers into secrets.md.

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
