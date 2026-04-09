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
   - If the user says "apply"/"submit"/"投" + a specific job URL or role → enter **Single Apply Mode**: run the Phase 1 research steps for that job (fetch JD, extract keywords, research company, create folder), then go directly to Phase 2 → Phase 2.5 → Phase 3 for that job only.
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

### Phase 1: Search + Research

Find jobs until `pending + today_submitted >= config.daily_target`.

Search `config.search.platforms` in parallel per `${CLAUDE_SKILL_DIR}/references/search-guide.md`.
Searches may use Playwright MCP, WebSearch, or WebFetch for job discovery.
Filter per `${CLAUDE_SKILL_DIR}/references/selection-strategy.md`. Deduplicate.

**For each candidate job — complete ALL steps before moving to the next job:**
1. Fetch the full JD text (do not add to TRACKER yet)
2. Apply ALL filters from `${CLAUDE_SKILL_DIR}/references/selection-strategy.md` — especially sponsorship and citizenship checks. If the job fails any filter → **skip entirely, do not create folder, do not add to TRACKER**
3. Only if the job passes all filters — complete ALL of the following before proceeding to the next job:
   a. Add a row to TRACKER.md as ⬜ NOT SUBMITTED
   b. Create folder `applications/YYYY-MM-DD_Company_Role/`
   c. Save full JD text to `{APP_FOLDER}/jd.md`
   d. Extract JD keywords → `{APP_FOLDER}/jd-keywords.json` (format: `{"required_skills":[], "preferred_skills":[], "keywords":[]}`)
   e. Find and read the company About/Mission page; save summary to `{APP_FOLDER}/notes.md` (include: industry, product, size, stage, culture, JD URL)
   f. Write `{APP_FOLDER}/STATUS.md` as `⬜ NOT SUBMITTED`
   
   **A job is only "done" in Phase 1 when all 6 files exist: TRACKER row + folder + jd.md + jd-keywords.json + notes.md + STATUS.md. Partial completion = not done.**

**Review checkpoint (if `config.automation.manual_review: true`):**
Show the user the list of jobs found (company, role, platform, URL). Wait for user to confirm which jobs to proceed with. Remove any rejected jobs from TRACKER.md and their folders.

### Phase 1.5: Network Scan (optional — requires LinkedIn login in Playwright profile)

For each company in TRACKER.md with ⬜ status:
1. Navigate to LinkedIn: `linkedin.com/search/results/people/?keywords={COMPANY}&network=%5B%22F%22%5D` (filters to 1st-degree connections)
2. If connections found at this company → add their name and title to the job's Notes column in TRACKER.md (e.g. "🤝 John Doe - SWE @ Company")
3. Move jobs with connections to higher priority

Skip this phase if LinkedIn is not logged in or if it gets blocked. Do not spend more than 30 seconds per company.

### Phase 2: Prepare (resume + cover letter only)

For each job whose `STATUS.md` contains `⬜ NOT SUBMITTED` AND whose folder contains `jd.md`. All research is already done — read local files only, no web requests needed.

1. Read `{APP_FOLDER}/jd.md` — full JD text
2. Read `{APP_FOLDER}/jd-keywords.json` — extracted keywords
3. Read `{APP_FOLDER}/notes.md` — company info
4. Select template from `uploaded-resumes/` per `${CLAUDE_SKILL_DIR}/references/template-guide.md`
5. Read `user-profile.md` for personal info (contact, work auth, EEO)
6. Tailor resume per `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md`
7. Generate cover letter per `${CLAUDE_SKILL_DIR}/references/cover-letter-guide.md` (if `config.prepare.cover_letter_required`)
8. Generate DOCX + PDF
9. Write `STATUS.md` as `📁 PREPARED — NOT SUBMITTED`

Can parallelize with subagents (no browser needed). Use the Prepare Subagent Prompt Template below.

**After all Prepare subagents complete — sync TRACKER.md:**
Scan every `applications/*/STATUS.md`. For each folder with `📁 PREPARED` or `✅ SUBMITTED`, ensure the corresponding TRACKER.md row reflects that status.

### Phase 2.5: Auto-Review (MANDATORY — always runs)

After all materials are prepared, the **main agent** reviews each application. Run these checks:

1. **Content**: Apply the same rules from `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md` to verify compliance.
2. **Format**: Read the generated PDF and check for rendering issues — stray markdown characters (`*`, `**`, `#`), broken formatting, garbled text, missing sections.
3. **Page fit**: Verify exactly 1 page — not overflowing, not too short.
4. **AI writing detection + ATS keyword score**: Run `node ${CLAUDE_SKILL_DIR}/scripts/ats_score.js {APP_FOLDER}/resume.md {APP_FOLDER}/jd-keywords.json`. (`jd-keywords.json` was already created in Phase 1 — do not regenerate it.) Check results:
   - `ats_score < 60` → add missing keywords naturally into resume, regenerate
   - `ai_phrases_found` → replace flagged phrases with suggested alternatives
   - `ai_patterns_found` → rewrite affected sentences
5. **ATS parse check**: Run `node ${CLAUDE_SKILL_DIR}/scripts/ats_parse_check.js {APP_FOLDER}/resume.pdf`. Check results:
   - `status: FAIL` → fix errors (missing sections, bad formatting), regenerate
   - `status: WARN` → review warnings, fix if possible

Auto-fix any issues found, regenerate DOCX + PDF if changed.

**Review checkpoint (if `config.automation.manual_review: true`):**
After auto-review, show the user a summary of each prepared application and any issues found/fixed. Wait for user to confirm which to submit. Mark rejected ones as ❌ SKIPPED in TRACKER.md.

### Phase 3: Submit

**Two modes depending on `config.automation.manual_review`:**

#### Manual Review Mode (`manual_review: true`) — Parallel subagents, user submits manually

Subagents still run in parallel across the N Playwright instances. Each subagent's job ends at the review page — the user submits manually in the browser.

**Subagent behavior (manual_review: true):**
```
1. Navigate to job URL (opens a new tab in the assigned Playwright browser instance)
2. Fill all forms and upload tailored resume as normal
3. Navigate to the final review/confirmation page — do NOT click Submit
4. Take screenshot → {APP_FOLDER}/review-screenshot.png
5. Return "REVIEW_READY: {COMPANY} — {ROLE} | screenshot: {APP_FOLDER}/review-screenshot.png"
   (Task is complete — browser tab stays open at the review page)
```

**Main agent behavior (manual_review: true):**
```
active_subagents = 0
WHILE today_submitted < config.daily_target OR active_subagents > 0:
    // Dispatch up to N subagents (N = config.submit.parallel_instances)
    WHILE active_subagents < N AND more jobs with 📁 PREPARED:
        Launch next subagent (run_in_background: true, mode=REVIEW_ONLY)
        active_subagents++

    // Handle incoming results (non-blocking — process as they arrive)
    When a subagent returns REVIEW_READY:
        active_subagents--
        Show user: "✋ {COMPANY} — {ROLE} ready. Screenshot: {APP_FOLDER}/review-screenshot.png
                    Submit in browser → reply 'submitted {COMPANY}' | 'skip {COMPANY}' | 'stop'"

    When user replies:
        "submitted {COMPANY}" → update TRACKER.md ✅, today_submitted++
        "skip {COMPANY}"      → update TRACKER.md ❌ SKIPPED
        "stop"                → drain active subagents then exit loop
END WHILE
```

#### Autonomous Mode (`manual_review: false`) — Parallel subagents

```
WHILE today_submitted < config.daily_target:
    1. Pick up to N jobs whose STATUS.md contains `📁 PREPARED` (N = config.submit.parallel_instances)
    2. Launch N subagents (run_in_background: true), each assigned a unique Playwright prefix
    3. Wait for ALL subagents in this batch to complete
    4. For EACH completed subagent — immediately update TRACKER.md:
       SUCCESS → change Status to ✅ SUBMITTED, fill Submitted date column, today_submitted++
       FAILED  → change Status to ❌ SKIPPED, add reason to Notes column
       Do NOT batch these updates — update one row at a time as each result comes in.
    5. After updating TRACKER.md, verify the row was written correctly by re-reading it.
    6. If more pending → repeat. If none → back to Phase 1.
END WHILE
```

**TRACKER.md update rule**: The main agent owns TRACKER.md. Update immediately after each result — never batch or skip.

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

**Application folder**: {APP_FOLDER}

Start from the research already saved in {APP_FOLDER}. You may do additional web research if needed (e.g. deeper company info, product details for cover letter).

**Input files (already exist in {APP_FOLDER}):**
- `jd.md` — full job description text
- `jd-keywords.json` — extracted JD keywords
- `notes.md` — company info (industry, product, size, culture)

**Steps:**
1. Read `{APP_FOLDER}/jd.md`, `{APP_FOLDER}/jd-keywords.json`, `{APP_FOLDER}/notes.md`
   **JD completeness check**: If `jd.md` is missing, empty, or clearly truncated (< 300 words, no responsibilities/requirements section), re-fetch the full JD from the URL in `notes.md` and overwrite `jd.md` and `jd-keywords.json`.
2. Select the best matching template from `uploaded-resumes/` per `${CLAUDE_SKILL_DIR}/references/template-guide.md` — read its full content for experience/skills
3. Read `user-profile.md` for personal info (contact, work auth, EEO)
4. Tailor resume per `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md`
   **Format**: follow `${CLAUDE_SKILL_DIR}/references/resume-format-spec.md` exactly. `create_resume.js` enforces this automatically.
5. Write `resume-config.json` (structured data for DOCX generation)
6. Generate DOCX: `node ${CLAUDE_SKILL_DIR}/scripts/create_resume.js {APP_FOLDER}/resume-config.json {APP_FOLDER}/resume.docx`
7. Generate PDF: `libreoffice --headless --convert-to pdf --outdir {APP_FOLDER} {APP_FOLDER}/resume.docx`
8. **Page check**: Read the generated PDF and verify exactly 1 page. If not, reduce bullets per role (min 1) and regenerate. Repeat until exactly 1 full page.
9. If `config.prepare.cover_letter_required`: write `cover-letter-config.json`, generate cover_letter.docx + PDF — reference specific company details from notes.md
10. Write `STATUS.md` as `📁 PREPARED — NOT SUBMITTED`
11. Do NOT submit anything — only prepare materials
12. Do NOT fabricate experience — only use info from the resume template
13. Return "PREPARED: {COMPANY} — {ROLE}" when done
```

---

## Submit Subagent Prompt Template

Replace `{variables}`, pass to Agent tool:

```
Submit application to {COMPANY} — {ROLE}.

**Mode:** {SUBMIT_MODE}  (either "AUTO_SUBMIT" or "REVIEW_ONLY")

**Goal:**
- AUTO_SUBMIT: Fill all forms, upload resume, and click Submit.
- REVIEW_ONLY: Fill all forms, upload resume, navigate to review/confirmation page — do NOT click Submit. Take screenshot and return "REVIEW_READY".

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
- **Resume upload**: ALWAYS upload {RESUME_PATH} — never use a previously saved resume from the ATS profile, even if one is already shown. Actively replace it.
- Screening questions: authorized=Yes, sponsorship=Yes (+explanation), 18+=Yes, background=Yes, previously worked=No. Check for follow-up fields after each answer.
- Experience/Education dates must match the tailored resume exactly — never guess
- Before submitting: verify all required fields are filled
- Screenshot before submit → {APP_FOLDER}/review-screenshot.png (if config.submit.screenshot_review)
- Screenshot after submit → {APP_FOLDER}/confirmation-screenshot.png (if config.submit.screenshot_confirmation)
- If stuck on any interaction for >config.submit.max_retries_per_form retries, skip and report why

**Output:**
- AUTO_SUBMIT: Write {APP_FOLDER}/STATUS.md as ✅ SUBMITTED. Return "SUCCESS" or "FAILED: [reason]"
- REVIEW_ONLY: Take screenshot → {APP_FOLDER}/review-screenshot.png. Do NOT write STATUS.md. Return "REVIEW_READY: {COMPANY} — {ROLE}"
- If friction encountered, append: "FRICTION: [what happened] → [what worked]"
```

---

## References

- **Job search**: `${CLAUDE_SKILL_DIR}/references/search-guide.md` — platform methods, deduplication
- **Job selection**: `${CLAUDE_SKILL_DIR}/references/selection-strategy.md` — filters, prioritization
- **Resume tailoring**: `${CLAUDE_SKILL_DIR}/references/tailoring-guide.md` — 8-step checklist
- **Resume format**: `${CLAUDE_SKILL_DIR}/references/resume-format-spec.md` — Times New Roman, black headers, 2-line company format, bullet skills
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
