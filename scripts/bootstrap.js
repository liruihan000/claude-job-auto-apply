#!/usr/bin/env node

/**
 * Bootstrap check — detects what's configured and what's missing.
 *
 * Paths:
 *   - skillDir: where the skill is installed (SKILL.md, references/, scripts/)
 *   - projectDir: user's working directory (config.json, templates/, applications/)
 *
 * Usage: node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js
 */

const fs = require('fs');
const path = require('path');

const skillDir = process.env.CLAUDE_SKILL_DIR || path.resolve(__dirname, '..');
const projectDir = process.cwd();
const ref = path.join(skillDir, 'references');

const missing = [];
const warnings = [];

// --- User data (in project root) ---

// config.json
const configPath = path.join(projectDir, 'config.json');
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} else {
  missing.push('config.json');
}

// Playwright detection — check project .mcp.json + global plugin
let playwrightInstances = [];

// Check project-level .mcp.json
const mcpPath = path.join(projectDir, '.mcp.json');
if (fs.existsSync(mcpPath)) {
  const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
  const servers = mcp.mcpServers || mcp;
  playwrightInstances = Object.keys(servers)
    .filter(k => k.startsWith('playwright'))
    .map(k => ({ name: k, prefix: `mcp__${k}__`, source: 'project' }));
}

// Check global plugin
const homeDir = require('os').homedir();
const globalPluginPaths = [
  path.join(homeDir, '.claude', 'plugins', 'marketplaces', 'claude-plugins-official', 'external_plugins', 'playwright', '.mcp.json'),
  path.join(homeDir, '.claude', 'plugins', 'playwright', '.mcp.json'),
];
for (const gp of globalPluginPaths) {
  if (fs.existsSync(gp) && playwrightInstances.length === 0) {
    playwrightInstances.push({ name: 'playwright', prefix: 'mcp__playwright__', source: 'global-plugin' });
  }
}

if (playwrightInstances.length === 0) {
  missing.push('playwright (no project .mcp.json or global plugin)');
}

// user-profile.md (in project root)
if (!fs.existsSync(path.join(projectDir, 'user-profile.md'))) {
  missing.push('user-profile.md');
}

// secrets.md (in project root)
if (!fs.existsSync(path.join(projectDir, 'secrets.md'))) {
  missing.push('secrets.md');
}

// templates (in project root)
const templatesDir = path.join(projectDir, 'templates');
let templateCount = 0;
if (fs.existsSync(templatesDir)) {
  templateCount = fs.readdirSync(templatesDir).filter(f =>
    f.endsWith('.docx') || f.endsWith('.pdf') || f.endsWith('.doc')
  ).length;
}
if (templateCount === 0) {
  missing.push('resume templates (no .docx/.pdf/.doc in templates/)');
}

// --- Directories (auto-create in project root) ---
const dirs = [
  path.join(projectDir, 'applications'),
  path.join(projectDir, 'templates'),
  path.join(projectDir, 'logs'),
];
const created = [];
for (const d of dirs) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
    created.push(path.relative(projectDir, d));
  }
}

// TRACKER.md
const trackerPath = path.join(projectDir, 'applications', 'TRACKER.md');
if (!fs.existsSync(trackerPath)) {
  fs.writeFileSync(trackerPath, `# Job Application Tracker

| Date | Company | Role | Platform | Status | Submitted | Notes |
|------|---------|------|----------|--------|-----------|-------|

**Today: 0/0 submitted**
`);
  created.push('TRACKER.md');
}

// --- Agent instruction file (in project root) ---
const agentFiles = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];
const hasAgentFile = agentFiles.some(f => fs.existsSync(path.join(projectDir, f)));
if (!hasAgentFile) {
  missing.push('agent instruction file (CLAUDE.md / AGENTS.md)');
}

// --- Cron / automation detection ---
const { execSync } = require('child_process');
let cronConfigured = false;
try {
  const crontab = execSync('crontab -l 2>/dev/null', { encoding: 'utf8' });
  cronConfigured = crontab.includes('job-auto-apply');
} catch (e) {}

let hasXvfb = false;
try {
  execSync('which xvfb-run', { encoding: 'utf8' });
  hasXvfb = true;
} catch (e) {}

const hasDisplay = !!process.env.DISPLAY;

// --- Warnings ---
warnings.push('Gmail MCP is optional (for email verification). If not connected, skip email steps.');
warnings.push('Indeed MCP is optional (for faster job search). If not connected, use Playwright to search Indeed.');

// --- Output ---
const result = {
  ready: missing.length === 0,
  missing,
  created,
  warnings,
  paths: {
    skill: path.relative(projectDir, skillDir),
    project: projectDir,
    templates: 'templates',
    applications: 'applications',
    tracker: 'applications/TRACKER.md',
    logs: 'logs',
  },
  config: {
    daily_target: config.daily_target || 30,
    job_search: config.job_search || config.search || null,
    automation: config.automation || null,
  },
  playwright: {
    count: playwrightInstances.length,
    instances: playwrightInstances,
  },
  templates: templateCount,
  cron: {
    configured: cronConfigured,
    has_xvfb: hasXvfb,
    has_display: hasDisplay,
  },
};

console.log(JSON.stringify(result, null, 2));
