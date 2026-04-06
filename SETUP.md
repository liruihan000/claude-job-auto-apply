# Setup Guide (for Claude Code)

This file is read by SKILL.md when `bootstrap.js` returns `ready: false`.

## Setup Rules

- **One step at a time.** Ask one question, wait for answer, then next question.
- **Simple direct questions.** Just ask and let user type. No numbered option menus.
- **Match user's language.** If they write in Chinese, respond in Chinese.
- **Write files immediately** after getting each answer.
- **Confirm each step** before moving on: "Done. Next: ..."
- **Auto-do everything possible.** Only ask when user input is truly needed.
- **CRITICAL: Skip what's already done.** `bootstrap.js` returns a `steps` array. Each step has `status: "ok"|"missing"|"incomplete"` and `details`. **You MUST check each step's status. ONLY run steps where status is NOT `"ok"`.** Do NOT start from Step 1 blindly — jump directly to the first failing step. If `"incomplete"`, fix only the items listed in `details`.
- **Patch incomplete config.** If step 2 shows missing config fields, read the existing `config.json`, ask user only for fields that require user input, fill remaining missing fields with template defaults, and write back the updated config.

## Step 1: Resume + Profile (most important)

Ask: "Drop your resume (.docx or .pdf) into the `uploaded-resumes/` folder, then tell me when it's there."

Once available, read the resume and auto-extract everything into `user-profile.md`.
**Follow the exact format in `${CLAUDE_SKILL_DIR}/references/user-profile.example.md`** — same sections, same field names, same structure.

Then ask the user for any fields that couldn't be extracted from the resume (combine into one message). Write all answers into `user-profile.md`.

## Step 2: Job Preferences + Credentials (one combined question)

Ask:
- "What job titles? (e.g. Software Engineer, AI Engineer)"
- "What locations? (e.g. Remote, New York)"
- "How many per day? (default: 30)"
- "Do you want to review and approve jobs/materials before each phase proceeds, or run fully automatically? (review / auto)"
  - **This question is mandatory** — do not skip, do not assume a default. If user doesn't answer, ask again.

Read `${CLAUDE_SKILL_DIR}/config.example.json` as the template. Fill in user's answers for fields that need user input (keywords, locations, daily_target, manual_review, prefer_google_signin), keep all other fields at their template defaults. Write into `config.json`.

### `secrets.md` (optional, ask separately — explain why)

Tell user: "Some job sites require creating an account to apply. I'll store credentials locally in `secrets.md` (never uploaded, never shared) so the agent can auto-register and log in for you. You can skip this and handle logins manually. Set up now? (yes/no)"

If yes: read `${CLAUDE_SKILL_DIR}/references/secrets.example.md` for the format. Ask the user for each field, then write into `secrets.md`.
If no: create an empty `secrets.md` with just `# Secrets — Skipped` so bootstrap won't ask again.

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
         "args": ["@playwright/mcp@latest", "--user-data-dir", "{HOME}/.playwright/profile-1"]
       },
       "playwright-2": {
         "command": "npx",
         "args": ["@playwright/mcp@latest", "--user-data-dir", "{HOME}/.playwright/profile-2"]
       }
     }
   }
   ```
   - **Replace `{HOME}` with the user's actual home directory** (run `echo $HOME` to get it). Do NOT use `~` — it won't be expanded in JSON args.
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
