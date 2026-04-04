# Setup Reference (for Claude Code)

This file is read by Claude Code during the first-run setup wizard. It contains the configuration details needed to guide the user through setup.

## Setup Detection

Check these files to determine if setup is needed:

| File | Missing = | Action |
|------|-----------|--------|
| `.mcp.json` | No Playwright configured | Generate based on user's choice |
| `references/user-profile.md` | No user profile | Copy from `.example.md`, guide user to fill |
| `references/secrets.md` | No credentials | Copy from `.example.md`, guide user to fill |
| `Basic/templates/*.docx` | No resume templates | Ask user to add at least one |
| `Basic/applications/TRACKER.md` | No tracker | Auto-create with header |

## Playwright MCP Configuration

Generate `.mcp.json` based on user's chosen parallelism level.

### Single Instance (basic)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--profile-dir", "~/.playwright/profile-1"]
    }
  }
}
```

Tool prefix: `mcp__playwright__*`

### 3 Parallel Instances (recommended for batch mode)

```json
{
  "mcpServers": {
    "playwright-1": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--profile-dir", "~/.playwright/profile-1"]
    },
    "playwright-2": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--profile-dir", "~/.playwright/profile-2"]
    },
    "playwright-3": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--profile-dir", "~/.playwright/profile-3"]
    }
  }
}
```

Tool prefixes: `mcp__playwright-1__*`, `mcp__playwright-2__*`, `mcp__playwright-3__*`

### Notes
- `--profile-dir` enables persistent login sessions (cookies, Google SSO survive across runs)
- After generating `.mcp.json`, tell the user to **restart Claude Code** for MCP servers to load
- If user has existing MCP config, merge playwright entries into it (don't overwrite)

## MCP Connectors (via Claude Code Settings)

These are configured through Claude Code's built-in connector settings (not `.mcp.json`). Detect availability by checking if their tools exist.

| Connector | Tools prefix | Purpose | Required? |
|-----------|-------------|---------|-----------|
| Gmail | `mcp__claude_ai_Gmail__*` | Auto-read verification emails during ATS registration | Recommended |
| Indeed | `mcp__claude_ai_Indeed__*` | Search jobs via Indeed API | Recommended (without it, user must provide URLs) |
| Google Calendar | `mcp__claude_ai_Google_Calendar__*` | Interview scheduling | Optional |
| Notion | `mcp__claude_ai_Notion__*` | Sync tracker to Notion | Optional |

Tell user to connect via: Claude Code Settings → Connectors → [Service Name]

## Headless Server Setup (Optional)

If user is running on a server without a display:

```bash
sudo apt-get install -y xvfb
```

Cron job for daily auto-run:

```
0 6 * * * xvfb-run /path/to/claude --dangerously-skip-permissions -p '/auto-apply-v2' >> ~/Career/logs/auto-apply.log 2>&1
```

## Directory Structure to Create

```bash
mkdir -p Basic/applications Basic/templates logs
```

## TRACKER.md Template

If `Basic/applications/TRACKER.md` doesn't exist, create it:

```markdown
# Job Application Tracker

| Date | Company | Role | Platform | Status | Submitted | Notes |
|------|---------|------|----------|--------|-----------|-------|

**Today (YYYY-MM-DD): 0/30 submitted**
```

## Troubleshooting Reference

| Problem | Solution |
|---------|----------|
| Playwright tools not found | Restart Claude Code after creating `.mcp.json` |
| "Cannot open display" in cron | Install Xvfb, use `xvfb-run` |
| ATS login expired | Sessions persist in profiles; agent auto-re-logins via `secrets.md` |
| Resume PDF not generating | Install LibreOffice: `sudo apt install libreoffice` |
| Cron not running | Check `crontab -l`; check `systemctl status cron` |
