# Resume Format Specification

This spec defines the visual style for all generated resumes. `create_resume.js` implements it automatically. When modifying any resume DOCX manually (e.g. python-docx edits), follow these rules exactly.

## Font
- **Family**: Times New Roman throughout
- **Name (header)**: 20pt bold, centered
- **Contact line**: 10pt centered
- **Work Auth line**: 10pt italic centered
- **Section headers**: 11pt bold black
- **Body / bullets**: 10pt
- **Company name / dates (line 1)**: 10pt bold
- **Title / city (line 2)**: 10pt italic

## Colors
- **All text**: `#000000` (black) — no blue, no gray
- **Section header border**: black single underline

## Page Layout
- **Size**: US Letter (8.5" × 11")
- **Margins**: 0.5" all sides
- **Columns**: single column only — no tables, no text boxes

## Section Headers
- ALL CAPS, bold, 11pt, black
- Bottom border: single black underline
- Spacing: 6pt before, 2pt after
- Example: `PROFESSIONAL EXPERIENCE`

## Company / Job Header (2-line format)
```
Line 1: [Company Name bold left]          [Date bold right]
Line 2: [Title italic left]               [City italic right]
```
- Line 1: space_before=4pt, space_after=0pt
- Line 2: space_before=0pt, space_after=1pt
- Right-alignment via tab stop at page right margin

## Skills Section
- Format: `• Category: item1, item2, item3`
- **Category label**: bold
- **Items**: normal weight
- Each category on exactly **one line** (≤ ~110 chars total at 10pt TNR)
- Max **4 categories**
- space_after=1.5pt per line

## Bullet Points
- Standard `•` bullet
- Hanging indent (left=0.25", hanging=0.13")
- 10pt, space_after=1pt
- Start with action verb

## Education
```
Line 1: [School Name bold left]           [Date right]
Line 2: [Degree italic] | [City italic]
```

## Hyperlinks (contact line)
- Use `ExternalHyperlink` with `style: "Hyperlink"` for LinkedIn and GitHub
- Display text: `LinkedIn` and `GitHub` (not full URLs)
- Email also linked with `mailto:`

## Page Fit
- Must be **exactly 1 page** — no overflow
- **Minimize blank space** — bottom whitespace should be ≤ 2 lines
- If overflow: trim least relevant bullets, then reduce spacing
- If too short / too much whitespace: add bullets, include project section, expand skills, or tighten spacing slightly to push content lower

## ATS Compatibility
- No tables, columns, headers/footers, images, or graphics
- Standard section names: SUMMARY, TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE, RELEVANT PROJECT, EDUCATION
- Dates format: `Mon YYYY – Mon YYYY` (e.g. `Jun 2024 – Present`)
- File: generate both `.docx` and `.pdf`
