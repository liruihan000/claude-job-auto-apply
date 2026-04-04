# Career Project — Claude Code Instructions

## Primary Goal
Automate job applications to reach **30 new submissions per day**. Every session should continue from where the last one left off.

## On Every Session Start (AUTO-EXECUTE)

### Step 0: First-Run Setup Check
Check if the project is configured. If ANY of these are missing, run the interactive setup wizard BEFORE doing anything else:

1. **`.mcp.json`** does not exist → need Playwright config
2. **`references/user-profile.md`** does not exist → need user profile
3. **`references/secrets.md`** does not exist → need credentials
4. **`Basic/templates/`** is empty (no .docx files) → need resume templates

#### Setup Wizard (only runs if setup incomplete):

**Ask the user (in their language):**

1. "How many parallel browser instances? (1 = basic, 3 = recommended for batch mode)"
   - Generate `.mcp.json` based on their answer:
     - If 1: single `playwright` entry
     - If 2-3: `playwright-1`, `playwright-2`, `playwright-3` with persistent profiles
   - Always use `--profile-dir ~/.playwright/profile-{N}` for persistent login

2. "Do you have a user-profile.md ready, or should I help you create one?"
   - If no: copy from `user-profile.example.md`, then ask them to fill in their details
   - If yes: verify the file exists

3. "Do you have ATS login credentials configured?"
   - If no: copy from `secrets.example.md`, ask them to fill in email/password

4. "Place your resume template (.docx) in Basic/templates/ — do you have one ready?"
   - If no: explain they need at least one .docx resume to start

5. Create any missing directories: `mkdir -p Basic/applications Basic/templates logs`

6. If `Basic/applications/TRACKER.md` doesn't exist, create it with the header.

After setup is complete, report "Setup complete!" and continue to Step 1.

### Step 1: Auto-Apply Check
1. Read `Basic/applications/TRACKER.md` — this is the single source of truth
2. Count today's ✅ SUBMITTED entries → `today_submitted`
3. If `today_submitted >= 30` → report "今日目标已完成" and stop
4. If `today_submitted < 30` → immediately invoke `/auto-apply-v2` to enter the auto-apply loop
5. **Do NOT wait for user instructions** — start working automatically

## Parallel Execution with Playwright Instances
Read `.mcp.json` to detect how many Playwright instances are available:
- If 1 instance (`playwright`): submit jobs sequentially using `mcp__playwright__*`
- If 3 instances (`playwright-1/2/3`): submit up to 3 jobs in parallel

**Workflow:**
1. Main agent searches Indeed for matching jobs + checks pending (⬜) applications
2. Prepares up to N jobs (N = number of Playwright instances)
3. Launches N subagents in parallel using the Agent tool (run_in_background: true)
4. Waits for all N to complete → updates TRACKER.md
5. Repeats until `today_submitted == 30`

Use the subagent prompt template in `.claude/skills/auto-apply-v2/SKILL.md` (Auto-Apply Loop section).

## Autonomy
- Full permission to submit applications, agree to terms, register accounts, sign eSignatures
- No need to ask for confirmation at any step
- If blocked, skip and move to next job — log reason in TRACKER.md
- Never stop mid-loop — keep working until daily target is met
- Prefer Google Sign-In when available (persistent login in browser profiles)

## Key References
- User profile: `.claude/skills/auto-apply-v2/references/user-profile.md`
- Application tracker: `Basic/applications/TRACKER.md`
- Skill definition: `.claude/skills/auto-apply-v2/SKILL.md`

## Tools
- **Browser**: Use Playwright (`mcp__playwright*`) for browser automation
- **Email**: Use Gmail MCP for checking verification emails
- **Job search**: Use Indeed MCP (`mcp__claude_ai_Indeed__*`) for finding jobs

## Language
User speaks Mandarin and English. Respond in whatever language they use.
