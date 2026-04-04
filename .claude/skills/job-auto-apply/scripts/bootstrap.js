#!/usr/bin/env node

/**
 * Bootstrap check — detects what's configured and what's missing.
 * Run once on skill startup. Output tells Claude what to do next.
 *
 * Usage: node .claude/skills/job-auto-apply/scripts/bootstrap.js
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../../..');
const skillDir = path.resolve(__dirname, '..');
const ref = path.join(skillDir, 'references');

const missing = [];
const warnings = [];

// --- Required files ---

// config.json
const configPath = path.join(root, 'config.json');
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} else {
  missing.push('config.json');
}

// .mcp.json
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

// templates
const templatesDir = path.join(root, 'Basic', 'templates');
let templateCount = 0;
if (fs.existsSync(templatesDir)) {
  templateCount = fs.readdirSync(templatesDir).filter(f => f.endsWith('.docx')).length;
}
if (templateCount === 0) {
  missing.push('resume templates (no .docx in Basic/templates/)');
}

// CLAUDE.md
if (!fs.existsSync(path.join(root, 'CLAUDE.md'))) {
  missing.push('CLAUDE.md');
}

// --- Directories (auto-create) ---
const dirs = ['Basic/applications', 'Basic/templates', 'logs'];
const created = [];
for (const d of dirs) {
  const full = path.join(root, d);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    created.push(d);
  }
}

// TRACKER.md
const trackerPath = path.join(root, 'Basic', 'applications', 'TRACKER.md');
if (!fs.existsSync(trackerPath)) {
  fs.writeFileSync(trackerPath, `# Job Application Tracker

| Date | Company | Role | Platform | Status | Submitted | Notes |
|------|---------|------|----------|--------|-----------|-------|

**Today: 0/0 submitted**
`);
  created.push('TRACKER.md');
}

// --- Cron / automation detection ---
const { execSync } = require('child_process');
let cronConfigured = false;
try {
  const crontab = execSync('crontab -l 2>/dev/null', { encoding: 'utf8' });
  cronConfigured = crontab.includes('job-auto-apply');
} catch (e) {
  // no crontab
}

// Xvfb available?
let hasXvfb = false;
try {
  execSync('which xvfb-run', { encoding: 'utf8' });
  hasXvfb = true;
} catch (e) {}

// Has display?
const hasDisplay = !!process.env.DISPLAY;

// --- Warnings (optional but recommended) ---
warnings.push('Check if Gmail MCP is connected (needed for email verification)');
warnings.push('Check if Indeed MCP is connected (needed for job search)');

// --- Output ---
const result = {
  ready: missing.length === 0,
  missing,
  created,
  warnings,
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
