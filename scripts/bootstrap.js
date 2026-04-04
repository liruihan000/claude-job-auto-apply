#!/usr/bin/env node

/**
 * Bootstrap check — detects what's configured and what's missing.
 * All paths are relative to the skill directory (self-contained).
 *
 * Usage: node scripts/bootstrap.js (or node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js)
 */

const fs = require('fs');
const path = require('path');

// When installed via npx skills, ${CLAUDE_SKILL_DIR} points to the skill root.
// When run from scripts/, the skill root is one level up.
const skillDir = process.env.CLAUDE_SKILL_DIR || path.resolve(__dirname, '..');
const root = skillDir;
const ref = path.join(skillDir, 'references');

const missing = [];
const warnings = [];

// --- Required files ---

// config.json (in skill dir)
const configPath = path.join(skillDir, 'config.json');
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} else {
  missing.push('config.json');
}

// .mcp.json (in project root — needed for agent runtime)
const mcpPath = path.join(root, '.mcp.json');
let playwrightInstances = [];
if (fs.existsSync(mcpPath)) {
  const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
  const servers = mcp.mcpServers || mcp;
  playwrightInstances = Object.keys(servers)
    .filter(k => k.startsWith('playwright'))
    .map(k => ({
      name: k,
      prefix: `mcp__${k}__`,
    }));
  if (playwrightInstances.length === 0) {
    missing.push('.mcp.json (no playwright entries)');
  }
} else {
  missing.push('.mcp.json');
}

// user-profile.md
if (!fs.existsSync(path.join(ref, 'user-profile.md'))) {
  missing.push('user-profile.md');
}

// secrets.md
if (!fs.existsSync(path.join(ref, 'secrets.md'))) {
  missing.push('secrets.md');
}

// templates (in skill dir)
const templatesDir = path.join(skillDir, 'templates');
let templateCount = 0;
if (fs.existsSync(templatesDir)) {
  templateCount = fs.readdirSync(templatesDir).filter(f => f.endsWith('.docx')).length;
}
if (templateCount === 0) {
  missing.push('resume templates (no .docx in skill templates/)');
}

// --- Directories (auto-create within skill dir) ---
const dirs = [
  path.join(skillDir, 'applications'),
  path.join(skillDir, 'templates'),
  path.join(skillDir, 'logs'),
];
const created = [];
for (const d of dirs) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
    created.push(path.relative(root, d));
  }
}

// TRACKER.md
const trackerPath = path.join(skillDir, 'applications', 'TRACKER.md');
if (!fs.existsSync(trackerPath)) {
  fs.writeFileSync(trackerPath, `# Job Application Tracker

| Date | Company | Role | Platform | Status | Submitted | Notes |
|------|---------|------|----------|--------|-----------|-------|

**Today: 0/0 submitted**
`);
  created.push('TRACKER.md');
}

// --- Agent instruction file (CLAUDE.md etc — in project root) ---
const agentFiles = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];
const hasAgentFile = agentFiles.some(f => fs.existsSync(path.join(root, f)));
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
warnings.push('Check if Gmail MCP is connected (needed for email verification)');
warnings.push('Check if Indeed MCP is connected (needed for job search)');

// --- Output ---
const result = {
  ready: missing.length === 0,
  missing,
  created,
  warnings,
  paths: {
    skill: path.relative(root, skillDir),
    templates: path.relative(root, path.join(skillDir, 'templates')),
    applications: path.relative(root, path.join(skillDir, 'applications')),
    tracker: path.relative(root, trackerPath),
    logs: path.relative(root, path.join(skillDir, 'logs')),
  },
  config: {
    daily_target: config.daily_target || 30,
    job_search: config.job_search || null,
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
