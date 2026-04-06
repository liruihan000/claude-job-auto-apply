# Resume Tailoring Guide

This guide is read by the agent during Phase 2 (Prepare). Follow every step for every application.

## Tailoring Checklist

For each job, perform all steps in order:

### 1. Analyze JD
Before any editing, extract from the JD:
- **Hard requirements**: must-have skills, years of experience, degrees
- **Soft requirements**: preferred/nice-to-have skills
- **Keywords**: technical terms, tools, frameworks, methodologies
- **Tone**: startup vs enterprise, fast-paced vs structured

### 2. Rewrite Summary
Write 2-3 sentences mirroring the job posting's core requirements. Never reuse a summary across applications. Include the top 3 keywords from the JD naturally.

### 3. ATS Keyword Optimization
Extract top 10-15 keywords from the JD. For each keyword:
- Check if it appears in the selected resume template (the user actually has this skill)
- If yes: ensure it appears at least once in the resume (summary, bullets, or skills)
- If no: skip — never add skills the user doesn't have
- Use the **exact phrasing** from the JD (e.g. "React.js" not "React", "CI/CD" not "continuous integration") — ATS systems match exact strings
- Place high-priority keywords in the summary and skills section (ATS often weighs these higher)

### 4. Reorder Experiences
Place the most relevant role first. If the user has multiple roles, lead with the one that best matches the JD's primary requirements.

### 5. Cherry-Pick Bullets
Select only the `config.prepare.max_bullets_per_role` most relevant bullets per role. For each bullet:
- Must connect to a JD requirement
- Should contain at least one JD keyword
- Prefer bullets with quantifiable metrics (%, $, time saved, scale)
- Use action verbs that match the JD (e.g. JD says "design and build" → bullet starts with "Designed and built")

### 6. Adjust Job Titles
If the selected resume template provides title variants for a role, select the variant that best matches the target position title.

### 7. Adjust Skills Section
- Reorder skill categories so the most JD-relevant category leads
- Add JD-specific tools the user actually knows (check the selected resume template)
- Group skills to match JD sections (e.g. if JD has "Languages" and "Frameworks" separately, match that structure)
- Remove skills irrelevant to this specific role to reduce noise

### 8. Include/Exclude Optional Roles
If the selected resume template marks certain roles as "include when relevant" or "omit when space tight", make the decision based on JD relevance and page space.

### 9. ATS Compatibility Check
Before finalizing:
- No tables, columns, or complex formatting (ATS can't parse them)
- No headers/footers with critical info (ATS may skip them)
- Standard section headings: "Experience", "Education", "Skills", "Projects" (ATS looks for these)
- No images, icons, or graphics
- Dates in consistent format (e.g. "Jun 2024 – Present")
- File format: .docx preferred (some ATS struggle with PDF parsing)

### 10. Verify 1-Page Fit
The final resume must fit a single US Letter page. If it overflows, cut the least relevant content first (optional roles → less relevant bullets → projects). **Minimize blank space — bottom whitespace should be ≤ 2 lines.** If there is significant whitespace, add more relevant bullets, include optional roles/projects, or expand the skills section. A well-filled page signals strong experience.

## ATS Score Self-Check

After tailoring, mentally score the resume:
- **Keyword match rate**: what % of JD keywords appear in resume? Target: 80%+
- **Section completeness**: summary + skills + experience + education all present?
- **Formatting**: clean, single-column, standard headings?
- If score feels below 80%, revisit steps 3 and 5.

## Rules

- **Never fabricate experience** — only use information from the selected resume template
- **Never add skills/tools not in the source resume** — if the source doesn't list Prometheus, Grafana, gRPC, LangGraph, etc., do NOT add them. Only reorder or rephrase existing skills.
- **Never change job titles** — use the exact title from the source resume. Do not upgrade "Software Engineer" to "Technical Lead" or "Founding Engineer".
- **Never change dates** — all start/end dates must match the source resume exactly. Do not extend, shorten, or move date ranges.
- **Never inflate years of experience** — calculate from actual work history dates in the source resume. If total is ~3 years, write "3+ years", not "5+ years".
- **Never add companies or roles not in the source resume** — only include positions that exist in the selected template.
- **Never copy JD text verbatim** — rephrase in the user's voice
- **Metrics matter** — prefer bullets with quantifiable results, but only use metrics that exist in the source resume
- **Read the full JD** before starting — understand what the company actually needs
- **Exact keyword matching** — use the same terms as the JD, but only for skills the user actually has in the source resume
- **One resume per application** — never submit the same tailored resume twice
