# Setup Guide (for Claude Code)

This file is read by SKILL.md when `bootstrap.js` returns `ready: false`.

## Setup Rules

- **One step at a time.** Ask one question, wait for answer, then next question.
- **Simple direct questions.** Just ask and let user type. No numbered option menus.
- **Match user's language.** If they write in Chinese, respond in Chinese.
- **Write files immediately** after getting each answer.
- **Confirm each step** before moving on: "Done. Next: ..."
- **Auto-do everything possible.** Only ask when user input is truly needed.
- **Skip what's already done.** `bootstrap.js` returns a `missing` list — only run steps for items in that list. If a file already exists and is valid, skip its step entirely without mentioning it.

## Step 1: Resume + Profile (most important)

Ask: "Drop your resume (.docx or .pdf) into the `templates/` folder, then tell me when it's there."

Once available, read the resume and auto-extract everything into `user-profile.md`:
- Name, contact, location, links, work experience, education, skills, projects

Then ask only what's missing (combine into one message):
- "I extracted your info from the resume. A few things I couldn't find — please fill in:
  - Phone number?
  - Work authorization? (e.g. US Citizen, H-1B, Green Card)
  - Gender / Race / Veteran / Disability for EEO forms? (or 'prefer not to say' for all)"

Write all answers into `user-profile.md`.

## Step 2: Job Preferences + Credentials (one combined question)

Ask:
- "What job titles? (e.g. Software Engineer, AI Engineer)"
- "What locations? (e.g. Remote, New York)"
- "How many per day? (default: 30)"
- "Do you want to review and approve jobs/materials before each phase proceeds, or run fully automatically? (review / auto)"
  - **This question is mandatory** — do not skip, do not assume a default. If user doesn't answer, ask again.

Write answers into `config.json`.

### `secrets.md` (ask separately — explain why)

Tell user: "Some job sites require creating an account to apply. I'll store credentials locally in `secrets.md` (never uploaded, never shared) so the agent can auto-register and log in for you."

Then ask:
- "Email for job portal accounts?"
- "Password for auto-registration?"
- "Prefer Google Sign-In when available? (yes/no)"

Write answers into `secrets.md`.

### config.json template:
```json
{
  "daily_target": {answer_3},
  "search": {
    "platforms": ["indeed", "linkedin", "glassdoor", "ziprecruiter", "google_jobs"],
    "keywords": {answer_1},
    "locations": {answer_2},
    "job_type": "fulltime",
    "max_age_days": 7,
    "level_include": ["Entry", "Junior", "Associate", "Mid", "I", "II", "New Grad"],
    "level_exclude": ["Senior", "Staff", "Principal", "Lead", "Director"],
    "min_skills_overlap": 0.7
  },
  "prepare": {
    "cover_letter_required": true,
    "tailoring_checklist_steps": 10,
    "max_bullets_per_role": 4,
    "additional_documents": []
  },
  "submit": {
    "parallel_instances": 3,
    "max_retries_per_form": 3,
    "screenshot_review": true,
    "screenshot_confirmation": true,
    "prefer_google_signin": {answer_6}
  },
  "preferences": {
    "response_language": "match_user"
  },
  "automation": {
    "manual_review": "{answer_review}",
    "skip_on_no_sponsorship": true,
    "skip_on_citizenship_required": true,
    "auto_agree_terms": true,
    "auto_register_accounts": true,
    "auto_sign_esignatures": true
  }
}
```

## Step 3: LibreOffice (auto-install)

**Needed for DOCX→PDF conversion. Do silently if possible.**

1. Check `which libreoffice`:
   - If found → skip
   - If not → run `sudo apt-get install -y libreoffice-writer-nogui`
   - If sudo fails → tell user: "Please install LibreOffice for PDF conversion: `sudo apt-get install -y libreoffice-writer-nogui`"

## Step 4: Playwright (validate + fix)

**Compare config against actual `.mcp.json`, fix any mismatch.**

1. Read `config.json` → `config.submit.parallel_instances` (default 3) → call it `N`
2. Read `.mcp.json` in project root (if exists) → count entries matching `playwright*` → call it `actual`
3. Compare:

| Situation | Action |
|-----------|--------|
| No `.mcp.json` at all | Generate it with N instances |
| `actual < N` | Add missing instances to `.mcp.json` |
| `actual >= N` | Skip — Playwright is ready |
| `actual > N` | Fine, keep extra instances |

4. When generating/updating `.mcp.json`, use this format per instance:
   ```json
   {
     "mcpServers": {
       "playwright-1": {
         "command": "npx",
         "args": ["@playwright/mcp@latest", "--user-data-dir", "~/.playwright/profile-1"]
       },
       "playwright-2": {
         "command": "npx",
         "args": ["@playwright/mcp@latest", "--user-data-dir", "~/.playwright/profile-2"]
       }
     }
   }
   ```
   - Preserve any existing non-playwright entries in `.mcp.json`

5. Tell user: "Playwright configured. First run may need manual login to Google/job sites — after that it's automatic."

## Step 5: Auto-generate (no questions)

Silently create:
- **`CLAUDE.md`** in project root:
```markdown
# Auto-Apply Project

## On Every Session Start (AUTO-EXECUTE)
1. Invoke `/job-auto-apply` — it handles everything (config check, setup, pipeline)
2. **Do NOT wait for user instructions** — start working automatically

## Autonomy
- Full permission to submit applications, agree to terms, register accounts, sign eSignatures
- All behavior controlled by config.json
- If blocked, skip and move to next job
- Never stop mid-loop until daily target is met
```

- Check if Gmail MCP is connected (`mcp__claude_ai_Gmail__*` tools available):
  - **If not connected** → Tell user: "Gmail MCP is not connected. It's optional — used for email verification codes during account registration on job sites. If you want to enable it, go to Settings → Connectors → Gmail. You can skip this and handle verification codes manually when needed."
  - If connected → skip silently

## Step 6: Daily Cron (optional)

Ask: "Want auto-apply to run daily? If yes, what time? (e.g. 6 AM) Your computer must be on at that time."

If yes, detect environment and set up:
- Check `which xvfb-run` for headless support
- Get claude path: `which claude`
- Get project dir: `pwd`
- Add cron:
```
0 {HOUR} * * * cd {PROJECT_DIR} && xvfb-run {CLAUDE_PATH} --dangerously-skip-permissions -p '/job-auto-apply' >> {PROJECT_DIR}/logs/auto-apply.log 2>&1
```
- If no Xvfb and no DISPLAY: tell user to install (`sudo apt-get install -y xvfb`)

## Step 7: Final

Ask: "Anything else to customize? (companies to target/avoid, extra job boards, resume preferences, additional documents to upload)"

Route answers to:
- Job preferences → `config.json`
- Search platforms → `${CLAUDE_SKILL_DIR}/references/search-guide.md`
- Resume rules → `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md`
- ATS workarounds → `${CLAUDE_SKILL_DIR}/ats-handlers/`
- Do NOT modify `SKILL.md`

## Final Verification (after all steps complete)

Re-run `node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js` and check:
- `ready: true` → Setup complete. Tell user: "Setup done. Restart Claude Code to activate Playwright, then run `/job-auto-apply`."
- `ready: false` → Show the `missing` list. Fix what can be auto-fixed, ask user for the rest. **Do NOT proceed to the auto-apply pipeline until `ready: true`.**
