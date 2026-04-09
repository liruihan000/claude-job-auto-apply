# Resume Tailoring Guide

This guide is read by the agent during Phase 2 (Prepare). Follow every step for every application.

## Core Philosophy: Micro-Adjust Only

**Do NOT rewrite the resume from scratch.** Start from the selected template and make only the permitted changes below. Everything else stays exactly as in the template.

---

## ⚠️ HARD RULES — Never Violate These

> These are checked in Phase 2.5. Violations cause the resume to be regenerated.

- **Never change skill category names** — `AI/ML` must stay `AI/ML`, not `AI/ML & Agents` or `LLMs & Vector DBs`. Copy the exact string from the template.
- **Never add skill categories** — use only the categories that exist in the selected template.
- **Never change job titles** — `Software Engineer` stays `Software Engineer`. Do not upgrade or rename.
- **Never change company names or dates** — exact copy from template.
- **Never add skills/tools not in the template** — if the template doesn't list it, don't add it.
- **Never fabricate numbers** — all metrics must come from the template.
- **Never omit a role** — all roles from the template must appear, minimum 1 bullet each.

---

## Permitted Changes (3 only)

### 1. Rewrite Summary
Write 2-3 sentences mirroring the job posting's core requirements. This is the only section written from scratch. Never reuse a summary across applications. Include the top 3 JD keywords naturally. Keep the same approximate length as the template summary.

### 2. Rephrase Bullets (select a subset)
For each role, select up to `config.prepare.max_bullets_per_role` bullets. For each selected bullet:
- Keep the same achievement, metric, and technical fact from the template
- Rephrase the wording to incorporate JD keywords naturally
- Do NOT change numbers, percentages, or scale figures
- Do NOT add tools or technologies not present in the original bullet
- **Length**: must not exceed the original bullet's line count (±20% word count). Do not expand a 1-line bullet into 2 lines.
- Bullets not selected are omitted — do not replace with invented content

**All roles must appear.** Use all bullets from a role if fewer than the max. If there is remaining whitespace at the bottom of the page, add back omitted bullets until the page is filled (≤ 2 lines whitespace at bottom).

### 3. Adjust Skills Section
**Category names are FIXED — copy exactly from the template, character for character.**

Within each category, you may:
- Remove items irrelevant to this role
- Reorder items (most JD-relevant first)
- Reorder categories (most JD-relevant category first)

You may NOT:
- Change a category name (e.g. do NOT rename `Data & Storage` to `Data & Observability`)
- Add items not in the template
- Add new categories
- Allow any category to wrap beyond one line (≤ ~110 chars including `• Category: ` prefix — trim items until it fits)

---

## What Stays Exactly As-Is (Do Not Touch)

- Role order (same as template)
- Job titles (exact copy from template)
- Company names (exact copy from template)
- Dates (exact copy from template)
- Education section (exact copy from template)
- Projects section (exact copy from template, if present)

---

## ATS Keyword Check

After writing the summary and rephrasing bullets, verify:
- Top 5 JD keywords appear at least once in the resume (summary or bullets)
- If a keyword is missing and the user has the skill (it's in the template), work it into a bullet rephrase
- Never add a keyword for a skill not in the template

## ATS Compatibility Check

Before finalizing:
- No tables, columns, or complex formatting
- Standard section headings: "Experience", "Education", "Skills", "Projects"
- Dates in consistent format (e.g. "Jun 2024 – Present")
- Generate both .docx and .pdf

## Verify 1-Page Fit

Must fit exactly 1 US Letter page. If overflow: reduce bullets per role (min 1). If too much whitespace (> 2 lines at bottom): add back bullets, starting from the most relevant omitted bullet.
