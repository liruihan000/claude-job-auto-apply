# Filing & Tracking Guide

## Application Folder

Each application gets its own folder:

```
${CLAUDE_SKILL_DIR}/applications/YYYY-MM-DD_Company_Role/
├── resume.pdf / .docx        # Tailored resume
├── cover_letter.pdf / .docx  # Tailored cover letter
├── notes.md                  # Company, role, URL, tailoring decisions
├── STATUS.md                 # ⬜ NOT SUBMITTED / ✅ SUBMITTED / ❌ SKIPPED / 🔵 INTERVIEWING
├── review-screenshot.png     # Pre-submit screenshot
└── confirmation-screenshot.png # Post-submit proof
```

## TRACKER.md

Single source of truth. Format:

```
| Date | Company | Role | Platform | Status | Submitted | Notes |
```

- `Date` = materials prepared date
- `Submitted` = actual submission date
- **Only the main agent updates TRACKER** (never subagents)

## Rules

- One folder per application, even if skipped
- Skipped jobs get `❌ SKIPPED` with reason in notes.md
- Screenshots are optional per `config.submit.screenshot_review` and `config.submit.screenshot_confirmation`
