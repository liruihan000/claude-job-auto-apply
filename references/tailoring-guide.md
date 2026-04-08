# Resume Tailoring Guide

This guide is read by the agent during Phase 2 (Prepare). Follow every step for every application.

## Core Philosophy: Micro-Adjust Only

**Do NOT rewrite the resume from scratch.** Start from the selected template and make only the two permitted changes below. Everything else — role order, job titles, dates, skills structure, skills order — stays exactly as in the template.

## The Two Permitted Changes

### 1. Rewrite Summary
Write 2-3 sentences mirroring the job posting's core requirements. This is the only section written from scratch. Never reuse a summary across applications. Include the top 3 keywords from the JD naturally. Keep the same approximate length as the template summary.

### 2. Rephrase Bullets (select a subset)
For each role, select up to `config.prepare.max_bullets_per_role` bullets. For each selected bullet:
- Keep the same achievement, metric, and technical fact from the template
- Rephrase the wording to incorporate JD keywords naturally
- Do NOT change numbers, percentages, or scale figures
- Do NOT add tools or technologies not present in the original bullet
- Bullets not selected are simply omitted — do not replace them with invented content

**All roles must appear.** If a role has fewer bullets than the max, include all of them.

## What Stays Exactly As-Is (Do Not Touch)

- Role order (same as template)
- Job titles (exact copy from template)
- Company names (exact copy from template)
- Dates (exact copy from template)
- Skills section — categories, order, and items (exact copy from template)
- Education section (exact copy from template)
- Projects section (exact copy from template, if present)

## ATS Keyword Check

After writing the summary and rephrasing bullets, verify:
- Top 5 JD keywords appear at least once in the resume (summary or bullets)
- If a keyword is missing and the user has the skill (it's in the template), naturally work it into a bullet rephrase
- Never add a keyword for a skill not in the template

## ATS Compatibility Check

Before finalizing:
- No tables, columns, or complex formatting (ATS can't parse them)
- Standard section headings: "Experience", "Education", "Skills", "Projects"
- Dates in consistent format (e.g. "Jun 2024 – Present")
- File format: generate both .docx and .pdf

## Verify 1-Page Fit

The final resume must fit a single US Letter page. If it overflows, reduce the number of bullets per role (minimum 1 per role). Never omit a role. **Bottom whitespace should be ≤ 2 lines** — if too much whitespace, add back omitted bullets.

## Rules

- **Never fabricate experience** — only use information from the selected resume template
- **Never add skills/tools not in the source resume**
- **Never change job titles, dates, or company names**
- **Never inflate years of experience**
- **Never copy JD text verbatim** — rephrase in the user's voice
- **Metrics must come from the template** — never invent numbers
- **Read the full JD** before starting
- **One resume per application** — never submit the same tailored resume twice
