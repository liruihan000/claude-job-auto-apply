# Career Project — Claude Code Instructions

## Primary Goal
Automate job applications to reach **10 new submissions per day**. Every session should continue from where the last one left off.

## On Every Session Start (AUTO-EXECUTE)
1. Read `Basic/applications/TRACKER.md` — this is the single source of truth
2. Count today's ✅ SUBMITTED entries → `today_submitted`
3. If `today_submitted >= 10` → report "今日目标已完成" and stop
4. If `today_submitted < 10` → immediately invoke `/auto-apply-v2` to enter the auto-apply loop
5. **Do NOT wait for user instructions** — start working automatically

## Parallel Execution with 3 Playwright Instances
Three isolated browser instances are available:
- `mcp__playwright-1__*` — persistent profile at `~/.playwright/profile-1`
- `mcp__playwright-2__*` — persistent profile at `~/.playwright/profile-2`
- `mcp__playwright-3__*` — persistent profile at `~/.playwright/profile-3`

**Workflow:**
1. Main agent searches Indeed for matching jobs + checks pending (⬜) applications
2. Prepares up to 3 jobs (creates folders, tailors resumes if needed)
3. Launches 3 subagents in parallel using the Agent tool (run_in_background: true):
   - Subagent A → `mcp__playwright-1__*`
   - Subagent B → `mcp__playwright-2__*`
   - Subagent C → `mcp__playwright-3__*`
4. Waits for all 3 to complete → updates TRACKER.md
5. Repeats until `today_submitted == 10`

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
- **Browser**: Use Playwright (`mcp__playwright-{1,2,3}__*`) for browser automation
- **Email**: Use Gmail MCP for checking verification emails
- **Job search**: Use Indeed MCP (`mcp__claude_ai_Indeed__*`) for finding jobs

## Language
User speaks Mandarin and English. Respond in whatever language they use.
