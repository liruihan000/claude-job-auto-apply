---
name: auto-apply
description: >
  Automated job application pipeline. Triggers on: "apply", "job application", "投简历",
  "申请工作", "auto apply", "批量投", or job URLs. Handles search, resume tailoring,
  form filling, and submission across all major ATS platforms.
metadata:
  version: "3.0.0"
  author: "liruihan000"
---

# Auto-Apply V3

> **Playwright instances** (3 parallel browsers with persistent profiles):
> - `mcp__playwright-1__*`, `mcp__playwright-2__*`, `mcp__playwright-3__*`
> Tools: `browser_snapshot`, `browser_navigate`, `browser_click`, `browser_type`, `browser_fill_form`, `browser_select_option`, `browser_file_upload`, `browser_press_key`, `browser_evaluate`, `browser_take_screenshot`, `browser_wait_for`, `browser_tabs`, `browser_hover`

---

## Stage -1: Auto-Check on Startup (MANDATORY)

Every time this skill is invoked:

1. Read `Career/Basic/applications/TRACKER.md`
2. Count `Submitted` column entries with today's date → `today_submitted`
3. List ⬜ NOT SUBMITTED entries with materials ready
4. Report: "今日已提交 X/30，待提交 Y 个"
5. If `today_submitted >= 30` → report done and stop
6. Otherwise → enter Auto-Apply Pipeline immediately

**AUTONOMY: MAXIMUM** — full permission for everything, never ask user, never stop mid-loop.

---

## Auto-Apply Pipeline

### Phase 1: Search

Find jobs until `pending + today_submitted >= 30`. Sources (parallel):
1. **Indeed MCP**: `search_jobs` with multiple keywords in parallel
2. **LinkedIn**: Use one playwright instance to browse `linkedin.com/jobs`

Keywords: "AI Engineer", "Software Engineer", "ML Engineer", "Full Stack Developer", "Data Engineer"
Locations: "New York, NY", "New Jersey", "Remote"

Filter using **Job Selection Strategy** (below). Add selected jobs to TRACKER.md as ⬜.

### Phase 2: Prepare

For each ⬜ job without materials:
1. Create folder: `Career/Basic/applications/YYYY-MM-DD_Company_Role/`
2. Read `references/user-profile.md` + `references/template-guide.md`
3. Tailor resume (8-step checklist — see `references/user-profile.md` Tailoring Checklist)
4. Generate cover letter (**MANDATORY** for every application)
5. Generate PDFs via bundled scripts
6. Write `notes.md` + `STATUS.md` (⬜)

Can parallelize with subagents (no browser needed).

### Phase 3: Submit

```
WHILE today_submitted < 30:
    1. Pick up to 3 jobs with ⬜ + materials ready
    2. Launch 3 subagents (run_in_background: true), each with own playwright
    3. Wait for completion
    4. Main agent updates TRACKER.md:
       SUCCESS → ✅, fill Submitted date, today_submitted++
       FAILED → ❌ SKIPPED with reason
    5. If more pending → repeat. If none → back to Phase 1.
END WHILE
Report: "今日已完成 10/10"
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
**ONLY use `mcp__playwright-{N}__*` tools. Never use other playwright instances.**
**Resume**: {RESUME_PATH}
**Cover letter**: {COVER_LETTER_PATH} (if exists)
**Application folder**: {APP_FOLDER}

Read `references/user-profile.md` for experience dates/titles/EEO defaults.
For ATS-specific strategies, read the matching file in `ats-handlers/` if the platform is recognized (workday.md, greenhouse.md, lever.md, indeed.md, taleo.md, oracle.md, etc).

**Contact info & form-fill data:** Read `references/user-profile.md`
**Credentials & login:** Read `references/secrets.md`

**Rules:**
1. Navigate → Apply → auto-agree all terms/cookies/eSignatures
2. Auto-register if needed
3. Upload resume + cover letter via browser_file_upload
4. Fill ALL fields — autocomplete fields: browser_type slowly:true → click dropdown
5. Experience/Education: read user-profile.md, fill ALL roles from tailored resume, never guess dates
6. Screening Qs: authorized=Yes, sponsorship=Yes (+explanation), 18+=Yes, background=Yes, previously worked=No
7. After any "Yes", check for follow-up explanation fields
8. PRE-SUBMIT: JS check all required fields filled, no "Select..." dropdowns, no empty conditionals
9. Screenshot → {APP_FOLDER}/review-screenshot.png
10. Submit → screenshot → {APP_FOLDER}/confirmation-screenshot.png
11. Write {APP_FOLDER}/STATUS.md as ✅ SUBMITTED
12. Return "SUCCESS" or "FAILED: [reason]"
13. If any single form interaction took >3 retries, append: "FRICTION: [what happened] → [what worked]"
```

---

## Job Selection Strategy

Daily target: **30 applications/day**. Maximize pass rate:

1. **Title**: AI Engineer, Software Engineer, ML Engineer, Full Stack Developer, Data Engineer
2. **Level**: Entry/Junior/Associate/"I"/New Grad. Avoid Senior/Staff/Principal.
3. **Sponsorship**: Prefer H-1B-friendly companies. Skip "no sponsorship"/"US citizen only".
4. **Skills**: 70%+ overlap with profile (Python, TypeScript, LLMs, AI/ML, React, cloud, APIs)
5. **Location**: NYC/NJ/Remote only
6. **Recency**: 24h → 3 days → 7 days. Skip older than 7 days.
7. **ATS speed**: Indeed > LinkedIn Easy Apply > Greenhouse/Lever > Workday/Taleo

---

## Account & Registration

Read `references/secrets.md` for login credentials (email/username, password, preferred login method).
- If ATS requires account registration, auto-register using credentials from secrets.md
- Prefer the login method specified in secrets.md (e.g., Google Sign-In)
- Auto-agree all terms/privacy/cookies

---

## Filing & Tracking

Application folder structure:
```
Career/Basic/applications/YYYY-MM-DD_Company_Role/
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
- Bottom line: `**Today (YYYY-MM-DD): X/30 submitted**`

---

## Key Rules

- **Tailor every resume.** Never submit a template as-is.
- **Cover letter mandatory** for every application.
- **Never fabricate experience** — only info from user-profile.md.
- **Pre-submit validation** — JS check all required fields before clicking submit.
- **On error**: retry up to 3 times, then skip and log reason.
- **Never stop** until daily target is met.
- User speaks Mandarin and English. Match their language.
