#!/usr/bin/env node

/**
 * Detect runtime configuration from config.json and .mcp.json
 * Used by Claude Code to get deterministic config values without LLM parsing.
 *
 * Usage: node scripts/detect_config.js
 * Output: JSON with all runtime parameters
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../../..');

// Read config.json
let config = {};
const configPath = path.join(projectRoot, 'config.json');
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Read .mcp.json to detect Playwright instances
let playwrightInstances = [];
const mcpPath = path.join(projectRoot, '.mcp.json');
if (fs.existsSync(mcpPath)) {
  const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
  const servers = mcp.mcpServers || mcp;
  playwrightInstances = Object.keys(servers)
    .filter(k => k.startsWith('playwright'))
    .map(k => ({
      name: k,
      prefix: `mcp__${k}__`,
      profile: servers[k].args?.find(a => a.includes('profile-dir'))
        ? servers[k].args[servers[k].args.indexOf('--profile-dir') + 1]
        : null
    }));
}

const result = {
  daily_target: config.daily_target || 30,
  playwright: {
    count: playwrightInstances.length,
    instances: playwrightInstances
  },
  job_search: config.job_search || {
    keywords: ["Software Engineer"],
    locations: ["Remote"],
    job_type: "fulltime",
    max_age_days: 7
  },
  application: {
    tracker_path: config.application?.tracker_path || "Basic/applications/TRACKER.md",
    applications_dir: config.application?.applications_dir || "Basic/applications",
    cover_letter_required: config.application?.cover_letter_required ?? true,
    max_retries: config.application?.max_retries_per_form || 3
  },
  automation: config.automation || {
    skip_on_no_sponsorship: true,
    skip_on_citizenship_required: true,
    auto_agree_terms: true
  }
};

console.log(JSON.stringify(result, null, 2));
