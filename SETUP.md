# Setup Guide (for Claude Code)

This file is read by SKILL.md when `bootstrap.js` returns `ready: false`.

## Setup Rules

- **One step at a time.** Ask one question, wait for answer, then next question. Never dump all questions at once.
- **Simple direct questions.** Just ask and let user type. Never give numbered option menus. No "1. I'll type it / 2. Skip" — just ask the question directly. Example: "Your password for job portals?" and user types the answer.
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

### Playwright Browser Setup
Ask: "How many parallel browsers? (recommended: 3)

This controls how many job applications are submitted at the same time. Each browser is an independent window that fills and submits one application. 3 browsers = 3 applications submitted simultaneously.

Each browser uses ~300-500MB RAM. Recommended: 3 for most machines (8GB+ RAM), up to 5 for 16GB+, up to 10 for 32GB+."

**First, check if Playwright is already available** (user may have global plugin):
- Check if `mcp__playwright__*` or `mcp__playwright-1__*` tools exist
- If yes: skip Playwright setup, report what's already available

**If not available, install based on N:**

If N=1: Run `Bash: claude plugin install playwright` to auto-install. No `.mcp.json` needed.

If N>1: Generate `.mcp.json` with N instances:
```json
{
  "mcpServers": {
    "playwright-{i}": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--user-data-dir", "~/.playwright/profile-{i}"]
    }
  }
}
```
Try writing via Bash: `cat > .mcp.json << 'EOF' ... EOF`
If blocked, output the JSON and tell user to create it manually.

After creating, tell user:
1. **"Restart Claude Code for browser instances to load."**
2. **"On the first run, the browser may ask you to log into Google or job portals manually. This only happens once — after that, login sessions are saved in persistent browser profiles and reused automatically."**

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
- EEO defaults — ask each separately:
  - "Gender? (Male / Female / Non-binary / Prefer not to say)"
  - "Race/Ethnicity? (Asian / White / Black / Hispanic / Prefer not to say)"
  - "Veteran status? (Not a veteran / Protected veteran)"
  - "Disability? (No / Yes / Prefer not to say)"
- Additional bullet variants per role? ("Want to add more bullet options for [Role]?")
- Any roles or projects not on the resume?

Write answers directly into user-profile.md — user should not need to edit the file manually.

### `secrets.md`
Copy from `${CLAUDE_SKILL_DIR}/references/secrets.example.md` to **project root** `./secrets.md`.
Ask user directly:
- "Some job sites (Workday, Oracle, Greenhouse) require creating an account before applying. What email should the agent use to register? (Can be the same as your resume email)"
- "Default password for these auto-registrations?"
- "Prefer Google Sign-In when available? (Faster, avoids creating separate accounts)"
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

If yes, ask: "What time? (e.g. 6:00 AM)

Note: your computer must be powered on at the scheduled time. If it's asleep or shut down, the job will be skipped. Servers that run 24/7 are ideal."

Then detect the environment and set up accordingly:

**Linux/macOS server (headless):**
1. Check if Xvfb is installed: `which xvfb-run`
2. If not: tell user to install it (`sudo apt-get install -y xvfb`)
3. Get the claude binary path: `which claude`
4. Get the project directory: `pwd`
5. Add cron job:
```
0 {HOUR} * * * cd {PROJECT_DIR} && xvfb-run {CLAUDE_PATH} --dangerously-skip-permissions -p '/job-auto-apply' >> {PROJECT_DIR}/logs/auto-apply.log 2>&1
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

### Final Check (always ask at the end of setup)
Ask: "Anything else you'd like to customize? For example:
- Specific companies to target or avoid
- Additional job boards to search
- Resume rules or preferences
- Application preferences"

If user has requests, update the appropriate files:
- Job preferences → `config.json`
- Search platforms → `${CLAUDE_SKILL_DIR}/references/search-guide.md`
- Resume rules → `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md`
- ATS workarounds → `${CLAUDE_SKILL_DIR}/ats-handlers/`
- Do NOT modify `SKILL.md` — it is the core pipeline logic and should not be auto-edited.
