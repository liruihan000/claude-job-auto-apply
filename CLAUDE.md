# Career Project — Claude Code Instructions

## Primary Goal
Automate job applications to reach **30 new submissions per day**. Every session should continue from where the last one left off.

## On Every Session Start (AUTO-EXECUTE)

### Step 0: First-Run Setup Check
Check if the project is configured. If ALL of these exist, **skip directly to Step 1**:
- `.mcp.json` exists
- `.claude/skills/auto-apply-v2/references/user-profile.md` exists
- `.claude/skills/auto-apply-v2/references/secrets.md` exists
- `Basic/templates/` has at least one .docx file

If ANY are missing, read **`INSTALL.md`** and follow its instructions to interactively guide the user through setup. After setup is complete, continue to Step 1.

### Step 1: Auto-Apply Check
1. Read `Basic/applications/TRACKER.md` — this is the single source of truth
2. Count today's ✅ SUBMITTED entries → `today_submitted`
3. If `today_submitted >= 30` → report "今日目标已完成" and stop
4. If `today_submitted < 30` → immediately invoke `/auto-apply-v2` to enter the auto-apply loop
5. **Do NOT wait for user instructions** — start working automatically

## Parallel Execution with Playwright Instances
Read `.mcp.json` to detect how many Playwright instances are available (1 to N).
Adapt parallelism dynamically — launch N subagents, each bound to its own instance.

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
- Setup guide: `INSTALL.md`
- User profile: `.claude/skills/auto-apply-v2/references/user-profile.md`
- Application tracker: `Basic/applications/TRACKER.md`
- Skill definition: `.claude/skills/auto-apply-v2/SKILL.md`

## Tools
- **Browser**: Use Playwright (`mcp__playwright*`) for browser automation
- **Email**: Use Gmail MCP for checking verification emails
- **Job search**: Use Indeed MCP (`mcp__claude_ai_Indeed__*`) for finding jobs

## Language
User speaks Mandarin and English. Respond in whatever language they use.
