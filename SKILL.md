---
name: job-auto-apply
description: >
  Autonomous job application agent. Searches jobs, tailors resumes per JD, generates cover letters,
  fills ATS forms, and submits applications across 10+ platforms — fully hands-free.
  Triggers on: "apply", "job application", "投简历", "申请工作", "auto apply", "批量投", or job URLs.
license: MIT
compatibility: >
  Requires Playwright MCP (browser automation) and Node.js 18+.
  Optional: Gmail MCP (email verification), Indeed MCP (job search).
metadata:
  version: "4.0.0"
  author: "liruihan000"
  repository: "https://github.com/liruihan000/claude-job-auto-apply"
---

# Job Auto-Apply

> **Configuration**: On startup, run `node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js` to load all runtime parameters.
> All values below prefixed with `config.*` come from `${CLAUDE_SKILL_DIR}/config.json`.
> If `bootstrap.js` returns `ready: false`, read `${CLAUDE_SKILL_DIR}/SETUP.md` and guide user through setup.
> Tools per Playwright instance: `browser_snapshot`, `browser_navigate`, `browser_click`, `browser_type`, `browser_fill_form`, `browser_select_option`, `browser_file_upload`, `browser_press_key`, `browser_evaluate`, `browser_take_screenshot`, `browser_wait_for`, `browser_tabs`, `browser_hover`

---

## Stage -1: Auto-Check on Startup (MANDATORY)

Every time this skill is invoked:

0. Run `node ${CLAUDE_SKILL_DIR}/scripts/bootstrap.js` → load config + check readiness
   - If `ready: false` → read `${CLAUDE_SKILL_DIR}/SETUP.md` and guide user through setup
   - Directories and TRACKER.md are auto-created by bootstrap.js
1. Read `${CLAUDE_SKILL_DIR}/applications/TRACKER.md`
2. Count `Submitted` column entries with today's date → `today_submitted`
3. List ⬜ NOT SUBMITTED entries with materials ready
4. Report: "今日已提交 X/{config.daily_target}，待提交 Y 个"
5. If `today_submitted >= config.daily_target` → report done and stop
6. Otherwise → enter Auto-Apply Pipeline immediately

**AUTONOMY: MAXIMUM** — full permission for everything, never ask user, never stop mid-loop.

---

## Auto-Apply Pipeline

### Phase 1: Search

Find jobs until `pending + today_submitted >= config.daily_target`. Sources (parallel):
1. **Indeed MCP**: `search_jobs` with `config.search.keywords` and `config.search.locations`
2. **LinkedIn**: Use one playwright instance to browse `linkedin.com/jobs`

Filter using **Job Selection Strategy** (below). Add selected jobs to TRACKER.md as ⬜.

### Phase 2: Prepare

For each ⬜ job without materials:
1. Create folder: `${CLAUDE_SKILL_DIR}/applications/YYYY-MM-DD_Company_Role/`
2. Read `references/user-profile.md` for experience pool
3. Select template per `references/template-guide.md`
4. Tailor resume per `references/tailoring-guide.md`
5. Generate cover letter per `references/cover-letter-guide.md` (if `config.prepare.cover_letter_required`)
6. Generate PDFs via bundled scripts
7. Write `notes.md` + `STATUS.md` (⬜)

Can parallelize with subagents (no browser needed).

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
Report: "今日已完成 X/{config.daily_target}"
```

### Phase 4: Retrospective (after daily target met or session end)

Check subagent return messages for `FRICTION:` lines:
1. **New ATS + friction** → create `ats-handlers/{platform}.md` with the workaround
2. **Known ATS + friction** → append fix as one bullet to existing handler
3. **No friction lines** → skip, no update needed

---

## Submit Subagent Prompt Template

Replace `{variables}`, pass to Agent tool:

```
Submit application to {COMPANY} — {ROLE}.

**Job URL**: {JOB_URL}
**ONLY use `{PLAYWRIGHT_PREFIX}*` tools. Never use other playwright instances.**
**Resume**: {RESUME_PATH}
**Cover letter**: {COVER_LETTER_PATH} (if exists)
**Application folder**: {APP_FOLDER}

Read `references/user-profile.md` for experience dates/titles/EEO defaults.
For ATS-specific strategies, read the matching file in `ats-handlers/` if the platform is recognized (workday.md, greenhouse.md, lever.md, indeed.md, taleo.md, oracle.md, etc).

**Contact info & form-fill data:** Read `references/user-profile.md`
**Credentials & login:** Read `references/secrets.md`

**Rules:**
1. Navigate → Apply → auto-agree all terms/cookies/eSignatures (if config.automation.auto_agree_terms)
2. Auto-register if needed (if config.automation.auto_register_accounts)
3. Upload resume + cover letter via browser_file_upload
4. Fill ALL fields — autocomplete fields: browser_type slowly:true → click dropdown
5. Experience/Education: read user-profile.md, fill ALL roles from tailored resume, never guess dates
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

## Job Selection Strategy

Read all criteria from config:

1. **Title**: `config.search.keywords`
2. **Level**: Include `config.search.level_include`, exclude `config.search.level_exclude`
3. **Sponsorship**: Skip if `config.automation.skip_on_no_sponsorship` and JD says "no sponsorship"/"US citizen only"
4. **Skills**: `config.search.min_skills_overlap` overlap with user-profile.md
5. **Location**: `config.search.locations`
6. **Recency**: Prefer recent, skip older than `config.search.max_age_days`
7. **ATS speed**: Indeed > LinkedIn Easy Apply > Greenhouse/Lever > Workday/Taleo

---

## Account & Registration

Read `references/secrets.md` for login credentials (email/username, password, preferred login method).
- If ATS requires account registration, auto-register (if `config.automation.auto_register_accounts`)
- Prefer Google Sign-In (if `config.submit.prefer_google_signin`)
- Auto-agree all terms/privacy/cookies (if `config.automation.auto_agree_terms`)

---

## Filing & Tracking

Application folder structure:
```
${CLAUDE_SKILL_DIR}/applications/YYYY-MM-DD_Company_Role/
├── resume.pdf + resume.docx
├── cover_letter.pdf + cover_letter.docx
├── notes.md (company, role, date, platform, tailoring decisions, job URL)
├── STATUS.md (✅ SUBMITTED / ⬜ NOT SUBMITTED / ❌ SKIPPED / 🔵 INTERVIEWING)
├── review-screenshot.png
└── confirmation-screenshot.png
```

**TRACKER.md** format: `| Date | Company | Role | Platform | Status | Submitted | Notes |`
- `Date` = materials prepared, `Submitted` = actual submission date
- **Only main agent updates TRACKER** (never subagents)

---

## Key Rules

- **Tailor every resume.** Never submit a template as-is.
- **Never fabricate experience** — only info from user-profile.md.
- **Pre-submit validation** — JS check all required fields before clicking submit.
- **On error**: retry up to `config.submit.max_retries_per_form` times, then skip and log reason.
- **Never stop** until daily target is met.
- Match user's language (see `config.preferences.response_language`).
