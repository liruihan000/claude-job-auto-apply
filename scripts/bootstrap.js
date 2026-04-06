#!/usr/bin/env node

/**
 * Bootstrap check — detects what's configured and what's missing.
 *
 * Output: structured JSON grouped by setup step.
 * Each step has: { status: "ok"|"missing"|"incomplete", details: [...] }
 *
 * Paths:
 *   - skillDir: where the skill is installed (SKILL.md, references/, scripts/)
 *   - projectDir: user's working directory (config.json, uploaded-resumes/, applications/)
 *
 * Usage: node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const skillDir = process.env.CLAUDE_SKILL_DIR || path.resolve(__dirname, '..');
const projectDir = process.cwd();
const ref = path.join(skillDir, 'references');
const homeDir = require('os').homedir();

// ============================================================
// Step 1: Resume + Profile
// ============================================================
const step1 = { step: 1, name: 'Resume + Profile', status: 'ok', details: [] };

// templates
const templatesDir = path.join(projectDir, 'uploaded-resumes');
let templateCount = 0;
if (fs.existsSync(templatesDir)) {
  templateCount = fs.readdirSync(templatesDir).filter(f =>
    f.endsWith('.docx') || f.endsWith('.pdf') || f.endsWith('.doc')
  ).length;
}
if (templateCount === 0) {
  step1.status = 'missing';
  step1.details.push('No resume templates in uploaded-resumes/ (.docx/.pdf/.doc)');
}

// user-profile.md — validate against example template
const profilePath = path.join(projectDir, 'user-profile.md');
const profileExamplePath = path.join(ref, 'user-profile.example.md');
const missingProfileFields = [];

if (!fs.existsSync(profilePath)) {
  step1.status = 'missing';
  step1.details.push('user-profile.md not found');
} else if (fs.existsSync(profileExamplePath)) {
  const profile = fs.readFileSync(profilePath, 'utf8');
  const example = fs.readFileSync(profileExamplePath, 'utf8');

  // Extract ## sections from example
  const sectionMatches = example.match(/^## .+/gm) || [];
  for (const section of sectionMatches) {
    const sectionName = section.replace(/^## /, '').trim();
    const pattern = new RegExp(`^## .*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '.*')}`, 'im');
    if (!pattern.test(profile)) {
      missingProfileFields.push(`section: ${sectionName}`);
    }
  }

  // Extract **Field**: entries from Core Identity section of example
  const coreSection = example.match(/## Core Identity[\s\S]*?(?=\n## |$)/);
  if (coreSection) {
    const fieldMatches = coreSection[0].match(/\*\*(\w[\w\s/]*)\*\*/g) || [];
    for (const field of fieldMatches) {
      const fieldName = field.replace(/\*\*/g, '').trim();
      const pattern = new RegExp(`\\*\\*${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*:\\s*\\S+`);
      if (!pattern.test(profile)) {
        missingProfileFields.push(fieldName);
      }
    }
  }

  if (missingProfileFields.length > 0) {
    step1.status = 'incomplete';
    step1.details.push(...missingProfileFields.map(f => `user-profile.md missing: ${f}`));
  }
}

// ============================================================
// Step 2: Config + Secrets
// ============================================================
const step2 = { step: 2, name: 'Config + Credentials', status: 'ok', details: [] };

const configPath = path.join(projectDir, 'config.json');
let config = {};
const missingConfigFields = [];

if (!fs.existsSync(configPath)) {
  step2.status = 'missing';
  step2.details.push('config.json not found');
} else {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Validate against config.example.json
  const configExamplePath = path.join(skillDir, 'config.example.json');
  if (fs.existsSync(configExamplePath)) {
    const configExample = JSON.parse(fs.readFileSync(configExamplePath, 'utf8'));

    function checkKeys(obj, example, keyPath) {
      for (const [key, value] of Object.entries(example)) {
        const fullPath = keyPath ? `${keyPath}.${key}` : key;
        if (obj === undefined || obj === null || obj[key] === undefined || obj[key] === null) {
          missingConfigFields.push(fullPath);
        } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          checkKeys(obj[key], value, fullPath);
        }
      }
    }

    checkKeys(config, configExample, '');
    if (missingConfigFields.length > 0) {
      step2.status = 'incomplete';
      step2.details.push(...missingConfigFields.map(f => `config.json missing: ${f}`));
    }
  }
}

// secrets.md
if (!fs.existsSync(path.join(projectDir, 'secrets.md'))) {
  if (step2.status === 'ok') step2.status = 'incomplete';
  step2.details.push('secrets.md not found (optional — will ask user)');
}

// ============================================================
// Step 3: LibreOffice
// ============================================================
const step3 = { step: 3, name: 'LibreOffice', status: 'ok', details: [] };

let hasLibreoffice = false;
try {
  execSync('which libreoffice', { encoding: 'utf8' });
  hasLibreoffice = true;
} catch (e) {
  step3.status = 'missing';
  step3.details.push('libreoffice not installed (install: sudo apt-get install -y libreoffice-writer-nogui)');
}

// ============================================================
// Step 4: Playwright
// ============================================================
const step4 = { step: 4, name: 'Playwright', status: 'ok', details: [] };

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

if (playwrightInstances.length === 0) {
  step4.status = 'missing';
  step4.details.push('No Playwright MCP found in project .mcp.json — SETUP will create it');
} else {
  const needed = (config.submit && config.submit.parallel_instances) || 1;
  if (playwrightInstances.length < needed) {
    step4.status = 'incomplete';
    step4.details.push(`Need ${needed} Playwright instances, found ${playwrightInstances.length}`);
  }
}

// ============================================================
// Step 5: Agent instruction file
// ============================================================
const step5 = { step: 5, name: 'Agent file + MCP connectors', status: 'ok', details: [] };

const agentFiles = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];
const hasAgentFile = agentFiles.some(f => fs.existsSync(path.join(projectDir, f)));
if (!hasAgentFile) {
  step5.status = 'missing';
  step5.details.push('No agent instruction file (CLAUDE.md / AGENTS.md)');
}

// ============================================================
// Step 6: Cron (optional — not blocking)
// ============================================================
const step6 = { step: 6, name: 'Daily Cron (optional)', status: 'ok', details: [] };

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

if (!cronConfigured) {
  step6.details.push('Cron not configured (optional)');
}

// ============================================================
// Auto-create directories + TRACKER
// ============================================================
const created = [];
const dirs = [
  path.join(projectDir, 'applications'),
  path.join(projectDir, 'uploaded-resumes'),
  path.join(projectDir, 'logs'),
];
for (const d of dirs) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
    created.push(path.relative(projectDir, d));
  }
}

const trackerPath = path.join(projectDir, 'applications', 'TRACKER.md');
if (!fs.existsSync(trackerPath)) {
  fs.writeFileSync(trackerPath, `# Job Application Tracker

| Date | Company | Role | Platform | Status | Submitted | Notes |
|------|---------|------|----------|--------|-----------|-------|

**Today: 0/0 submitted**
`);
  created.push('TRACKER.md');
}

// ============================================================
// Output
// ============================================================
const steps = [step1, step2, step3, step4, step5, step6];
const blocking = steps.filter(s => s.status === 'missing' || s.status === 'incomplete');
// Step 6 (cron) is never blocking
const ready = blocking.filter(s => s.step !== 6).length === 0;

const result = {
  ready,
  steps,
  created,
  warnings: [
    'Gmail MCP is optional (for email verification). If not connected, skip email steps.',
  ],
  paths: {
    skill: path.relative(projectDir, skillDir),
    project: projectDir,
    templates: 'uploaded-resumes',
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
