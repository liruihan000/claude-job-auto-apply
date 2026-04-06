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

0. **Check user intent**: 
   - If the user asks a question or says "discuss"/"analyze"/"review"/"look at" about a job → enter **Discussion Mode** (see below).
   - If the user says "apply"/"submit"/"投" + a specific job URL or role → enter **Single Apply Mode**: skip Phase 1 (search), go directly to Phase 2 for that job only, then Phase 2.5 → Phase 3.
   - Otherwise → continue to auto-apply flow.
1. Run `node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js` → load config + check readiness
   - If `ready: false` → read `${CLAUDE_SKILL_DIR}/SETUP.md` and guide user through missing items. **Do NOT proceed to any Phase. Do NOT attempt workarounds or alternative tools.**
   - Directories and TRACKER.md are auto-created by bootstrap.js
2. Read `applications/TRACKER.md`
3. Count `Submitted` column entries with today's date → `today_submitted`
4. List ⬜ NOT SUBMITTED entries with materials ready
5. Report: "Today: X/{config.daily_target} submitted, Y pending"
6. If `today_submitted >= config.daily_target` → report done and stop
7. Otherwise → enter Auto-Apply Pipeline immediately

**AUTONOMY:** If `config.automation.manual_review: false` → full autonomy, never ask user, never stop mid-loop. If `true` → pause between phases for user review before proceeding.

---

## Discussion Mode

When the user wants to discuss a specific job rather than auto-apply:

1. Read the job posting (via WebFetch, Playwright, or user-provided text)
2. Analyze: role requirements, tech stack, team, company info
3. Compare against the user's resumes in `uploaded-resumes/` and `user-profile.md`
4. Discuss with the user: fit assessment, pros/cons, resume strategy, questions to ask
5. **Do NOT enter the Auto-Apply Pipeline.** Stay in conversation until the user says to apply or ends the discussion.
6. If the user says "apply" or "submit" → add to TRACKER.md and proceed to Phase 2 for this job only.

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

After all materials are prepared, the **main agent** re-reads each tailored resume and compares it against the source resume in `uploaded-resumes/` and `user-profile.md`. Check:
1. **Content**: Apply the same rules from `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md` to verify compliance.
2. **Format**: Read the generated PDF and check for rendering issues — stray markdown characters (`*`, `**`, `#`), broken formatting, garbled text, missing sections.
3. **Page fit**: Verify exactly 1 page — not overflowing, not too short.

Auto-fix any issues found, regenerate DOCX + PDF if changed.

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
5. Write resume.md (tailored resume content) and resume-config.json (structured data for DOCX generation)
6. Generate DOCX: `node ${CLAUDE_SKILL_DIR}/scripts/create_resume.js {APP_FOLDER}/resume-config.json {APP_FOLDER}/resume.docx`
7. Generate PDF: `libreoffice --headless --convert-to pdf --outdir {APP_FOLDER} {APP_FOLDER}/resume.docx`
7a. **Page check**: Read the generated PDF and verify it is exactly 1 page. If not, adjust and regenerate DOCX+PDF. Options: adjust spacing/margins/font size in `create_resume.js` config, rephrase bullets shorter, reduce or add bullets. Prefer layout adjustments over deleting content. Repeat until exactly 1 full page.
8. Write cover_letter.md (if config.prepare.cover_letter_required) — must reference specific company/product details from research
9. If cover letter: `node ${CLAUDE_SKILL_DIR}/scripts/create_cover_letter.js {APP_FOLDER}/cover-letter-config.json {APP_FOLDER}/cover_letter.docx` then convert to PDF
10. Write notes.md with: company info, role, URL, template used, keywords mirrored, tailoring decisions, company research summary
11. Write STATUS.md as ⬜ NOT SUBMITTED
12. Do NOT submit anything — only prepare materials
13. Do NOT fabricate experience — only use info from the resume template
14. Return "PREPARED: {COMPANY} — {ROLE}" when done
```

---

## Submit Subagent Prompt Template

Replace `{variables}`, pass to Agent tool:

```
Submit application to {COMPANY} — {ROLE}.

**Goal:** Navigate to {JOB_URL}, complete the entire application, and submit it.

**Tools:** ONLY use `{PLAYWRIGHT_PREFIX}*` tools. Never use other playwright instances.

**Data sources:**
- `user-profile.md` — personal info, contact, work auth, EEO defaults
- `secrets.md` — credentials for login/registration
- Resume: {RESUME_PATH}
- Cover letter: {COVER_LETTER_PATH} (if exists)
- Additional documents: {ADDITIONAL_DOCS}
- ATS strategies: `${CLAUDE_SKILL_DIR}/ats-handlers/` (read matching platform file if recognized)

**Approach:** Observe the page at each step, decide what to do next. Every ATS is different — adapt to what you see rather than following a fixed sequence. General flow: navigate → find apply button → fill forms → upload files → review → submit. But let the page guide you.

**Constraints:**
- Auto-agree all terms/cookies/eSignatures (if config.automation.auto_agree_terms)
- Auto-register accounts if needed (if config.automation.auto_register_accounts)
- Fill ALL required fields — never leave a field empty or on "Select..."
- Screening questions: authorized=Yes, sponsorship=Yes (+explanation), 18+=Yes, background=Yes, previously worked=No. Check for follow-up fields after each answer.
- Experience/Education dates must match the tailored resume exactly — never guess
- Before submitting: verify all required fields are filled
- Screenshot before submit → {APP_FOLDER}/review-screenshot.png (if config.submit.screenshot_review)
- Screenshot after submit → {APP_FOLDER}/confirmation-screenshot.png (if config.submit.screenshot_confirmation)
- If stuck on any interaction for >config.submit.max_retries_per_form retries, skip and report why

**Output:**
- Write {APP_FOLDER}/STATUS.md as ✅ SUBMITTED
- Return "SUCCESS" or "FAILED: [reason]"
- If friction encountered, append: "FRICTION: [what happened] → [what worked]"
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
