---
name: job-auto-apply
description: >
  Autonomous job application agent. Searches jobs, tailors resumes per JD, generates cover letters,
  fills ATS forms, and submits applications across 10+ platforms — fully hands-free.
  Triggers on: "apply", "job application", "auto apply", or job URLs.
license: MIT
compatibility: >
  Full parallel mode: Claude Code, Cursor 2.4+, Codex CLI, Gemini CLI (subagent + Playwright MCP).
  Sequential mode: any agent with Playwright MCP support.
  Requires: Playwright MCP (browser automation), Node.js 18+.
  Optional: Gmail MCP (email verification).
metadata:
  version: "4.0.0"
  author: "liruihan000"
  repository: "https://github.com/liruihan000/claude-job-auto-apply"
---

# Job Auto-Apply

> **Configuration**: On startup, run `node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js` to load all runtime parameters.
> All values below prefixed with `config.*` come from `config.json`.
> If `bootstrap.js` returns `ready: false`, read `${CLAUDE_SKILL_DIR}/SETUP.md` and guide user through setup.
> Tools per Playwright instance: `browser_snapshot`, `browser_navigate`, `browser_click`, `browser_type`, `browser_fill_form`, `browser_select_option`, `browser_file_upload`, `browser_press_key`, `browser_evaluate`, `browser_take_screenshot`, `browser_wait_for`, `browser_tabs`, `browser_hover`

---

## Stage -1: Auto-Check on Startup (MANDATORY)

Every time this skill is invoked:

0. Run `node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js` → load config + check readiness
   - If `ready: false` → read `${CLAUDE_SKILL_DIR}/SETUP.md` and guide user through missing items. **Do NOT proceed to any Phase. Do NOT attempt workarounds or alternative tools.**
   - Directories and TRACKER.md are auto-created by bootstrap.js
1. Read `applications/TRACKER.md`
2. Count `Submitted` column entries with today's date → `today_submitted`
3. List ⬜ NOT SUBMITTED entries with materials ready
4. Report: "Today: X/{config.daily_target} submitted, Y pending"
5. If `today_submitted >= config.daily_target` → report done and stop
6. Otherwise → enter Auto-Apply Pipeline immediately

**AUTONOMY:** If `config.automation.manual_review: false` → full autonomy, never ask user, never stop mid-loop. If `true` → pause between phases for user review before proceeding.

---

## Auto-Apply Pipeline

### Phase 1: Search

Find jobs until `pending + today_submitted >= config.daily_target`.

Search `config.search.platforms` in parallel per `${CLAUDE_SKILL_DIR}/references/search-guide.md`.
Searches may use Playwright MCP, WebSearch, or WebFetch for job discovery.
Filter per `${CLAUDE_SKILL_DIR}/references/selection-strategy.md`. Deduplicate. Add selected jobs to TRACKER.md as ⬜.

**Review checkpoint (if `config.automation.manual_review: true`):**
Show the user the list of jobs found (company, role, platform, URL). Wait for user to confirm which jobs to proceed with. Remove any rejected jobs from TRACKER.md.

### Phase 2: Prepare

For each ⬜ job without materials:
1. Create folder: `applications/YYYY-MM-DD_Company_Role/`
2. Select template from `uploaded-resumes/` per `${CLAUDE_SKILL_DIR}/references/template-guide.md`, read its content for experience/skills
3. Read `user-profile.md` for personal info (contact, work auth, EEO)
4. Tailor resume per `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md`
5. Generate cover letter per `${CLAUDE_SKILL_DIR}/references/cover-letter-guide.md` (if `config.prepare.cover_letter_required`)
6. Generate DOCX via bundled scripts, then convert to PDF: `libreoffice --headless --convert-to pdf --outdir <folder> <file.docx>`
7. Write `notes.md` + `STATUS.md` (⬜)

Can parallelize with subagents (no browser needed). Use the Prepare Subagent Prompt Template below.

### Phase 2.5: Auto-Review (MANDATORY — always runs)

After all materials are prepared, the **main agent** re-reads each tailored resume and compares it against the source resume in `uploaded-resumes/` and `user-profile.md`. Apply the same rules from `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md` to verify compliance. Auto-fix any issues found, regenerate DOCX + PDF if changed.

**Review checkpoint (if `config.automation.manual_review: true`):**
After auto-review, show the user a summary of each prepared application and any issues found/fixed. Wait for user to confirm which to submit. Mark rejected ones as ❌ SKIPPED in TRACKER.md.

### Phase 3: Submit

```
WHILE today_submitted < config.daily_target:
    1. Pick up to N jobs with ⬜ + materials ready (N = config.submit.parallel_instances)
    2. Launch N subagents (run_in_background: true), each assigned a unique Playwright prefix
    3. Wait for completion
    4. Main agent updates TRACKER.md:
       SUCCESS → ✅, fill Submitted date, today_submitted++
       FAILED → ❌ SKIPPED with reason
    5. If more pending → repeat. If none → back to Phase 1.
END WHILE
Report: "Done: X/{config.daily_target} submitted"
```

### Phase 4: Retrospective (after daily target met or session end)

Check subagent return messages for `FRICTION:` lines:
1. **New ATS + friction** → create `${CLAUDE_SKILL_DIR}/ats-handlers/{platform}.md` with the workaround
2. **Known ATS + friction** → append fix as one bullet to existing handler
3. **No friction lines** → skip, no update needed

---

## Prepare Subagent Prompt Template

Replace `{variables}`, pass to Agent tool:

```
Prepare application materials for {COMPANY} — {ROLE}.

**Job URL**: {JOB_URL}
**Application folder**: {APP_FOLDER}

**Step 0 — Research:**
1. Navigate to {JOB_URL} using WebFetch or Playwright and read the FULL job description
2. Find the company website (usually linked in the JD or search "{COMPANY} about")
3. Read the company's About/Mission page — note: industry, product, size, stage, culture
4. Save all findings for use in resume tailoring and cover letter

**Step 1 — Prepare materials:**
Select template from `uploaded-resumes/` per `${CLAUDE_SKILL_DIR}/references/template-guide.md` — read its content for experience/skills.
Read `user-profile.md` for personal info (contact, work auth, EEO).
Tailor resume per `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md` — use the full JD and company info.
Generate cover letter per `${CLAUDE_SKILL_DIR}/references/cover-letter-guide.md` — reference specific company details.

**Rules:**
1. Create folder {APP_FOLDER} if it doesn't exist
2. Research FIRST — read original JD from source + company info before any tailoring
3. Select the best matching resume template
4. Follow every step of the tailoring checklist
5. Write resume.md (tailored resume content)
6. Write cover_letter.md (if config.prepare.cover_letter_required) — must reference specific company/product details from research
7. Write notes.md with: company info, role, URL, template used, keywords mirrored, tailoring decisions, company research summary
8. Write STATUS.md as ⬜ NOT SUBMITTED
9. Do NOT submit anything — only prepare materials
10. Do NOT fabricate experience — only use info from the resume template
11. Return "PREPARED: {COMPANY} — {ROLE}" when done
```

---

## Submit Subagent Prompt Template

Replace `{variables}`, pass to Agent tool:

```
Submit application to {COMPANY} — {ROLE}.

**Job URL**: {JOB_URL}
**ONLY use `{PLAYWRIGHT_PREFIX}*` tools. Never use other playwright instances.**
**Resume**: {RESUME_PATH}
**Cover letter**: {COVER_LETTER_PATH} (if exists)
**Additional documents**: {ADDITIONAL_DOCS} (from config.prepare.additional_documents — e.g. transcript, writing sample, portfolio)
**Application folder**: {APP_FOLDER}

Read `user-profile.md` for personal info (contact, work auth, EEO defaults).
For ATS-specific strategies, read the matching file in `${CLAUDE_SKILL_DIR}/ats-handlers/` if the platform is recognized (workday.md, greenhouse.md, lever.md, indeed.md, taleo.md, oracle.md, etc).

**Contact info & form-fill data:** Read `user-profile.md`
**Credentials & login:** Read `secrets.md`

**Rules:**
1. Navigate → Apply → auto-agree all terms/cookies/eSignatures (if config.automation.auto_agree_terms)
2. Auto-register if needed (if config.automation.auto_register_accounts)
3. Upload resume + cover letter via browser_file_upload
4. Fill ALL fields — autocomplete fields: browser_type slowly:true → click dropdown
5. Experience/Education: fill ALL roles from tailored resume, never guess dates
6. Screening Qs: authorized=Yes, sponsorship=Yes (+explanation), 18+=Yes, background=Yes, previously worked=No
7. After any "Yes", check for follow-up explanation fields
8. PRE-SUBMIT: JS check all required fields filled, no "Select..." dropdowns, no empty conditionals
9. Screenshot → {APP_FOLDER}/review-screenshot.png (if config.submit.screenshot_review)
10. Submit → screenshot → {APP_FOLDER}/confirmation-screenshot.png (if config.submit.screenshot_confirmation)
11. Write {APP_FOLDER}/STATUS.md as ✅ SUBMITTED
12. Return "SUCCESS" or "FAILED: [reason]"
13. If any single form interaction took >config.submit.max_retries_per_form retries, append: "FRICTION: [what happened] → [what worked]"
```

---

## References

- **Job search**: `${CLAUDE_SKILL_DIR}/references/search-guide.md` — platform methods, deduplication
- **Job selection**: `${CLAUDE_SKILL_DIR}/references/selection-strategy.md` — filters, prioritization
- **Resume tailoring**: `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md` — 8-step checklist
- **Cover letter**: `${CLAUDE_SKILL_DIR}/references/cover-letter-guide.md` — structure, rules
- **Template selection**: `${CLAUDE_SKILL_DIR}/references/template-guide.md` — which template for which JD
- **Filing & tracking**: `${CLAUDE_SKILL_DIR}/references/filing-guide.md` — folder structure, TRACKER format
- **User profile**: `user-profile.md` — personal info, contact, work auth, EEO
- **Credentials**: `secrets.md` — ATS login, registration, Google Sign-In

---

## Key Rules

- **Browser tool rules:**
  - **Job searching**: WebSearch, WebFetch, and Playwright are all OK.
  - **Everything that interacts with a web page** (form-filling, clicking, uploading, submitting, logging in, registering): **Playwright MCP (`mcp__playwright*`) ONLY.** Never use BrowserMCP, Claude-in-Chrome, or other browser tools.
  - If Playwright is unavailable, **STOP and run SETUP** — do not attempt alternative browser tools.
- **Tailor every resume.** Never submit a template as-is.
- **Never fabricate experience** — only use info from the resume templates in `uploaded-resumes/`.
- **Pre-submit validation** — JS check all required fields before clicking submit.
- **On error**: retry up to `config.submit.max_retries_per_form` times, then skip and log reason.
- **Never stop** until daily target is met.
- Match user's language (see `config.preferences.response_language`).
- **Self-updating**: When user requests a new search platform, ATS handler, or config change, update the corresponding files immediately (`config.json`, `${CLAUDE_SKILL_DIR}/references/search-guide.md`, `${CLAUDE_SKILL_DIR}/ats-handlers/*.md`) — don't ask user to edit manually.
