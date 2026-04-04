# Oracle HCM / Oracle Cloud ATS Handler

## Detection
- URL: `*.oraclecloud.com/hcmUI/CandidateExperience/*`, `fa-*.fa.ocs.oraclecloud.com/*`
- Page title often includes company name + "Careers" or "Talent Acquisition"
- React-based SPA with custom Oracle Redwood UI components

## Architecture
- Single-page application form (usually one long page, not multi-step wizard)
- Custom combobox dropdowns (NOT standard `<select>` elements)
- File upload via `<label>` click → file chooser modal
- Yes/No questions use button groups (not radio buttons)
- E-signature field at bottom

## Account & Login
- Often requires creating an account or signing in
- May redirect from Indeed — check if login page appears
- Use email/password approach; Google Sign-In rarely works on Oracle portals

## Form Filling Strategy

### CRITICAL: Use `browser_evaluate` for batch operations
Oracle's custom dropdowns are extremely slow to fill one-by-one via snapshot → click → snapshot → select. **Prefer JS-based filling when possible.**

### Combobox Dropdowns (Gender, Veteran, Disability Category, Salary)
These are Oracle Redwood custom comboboxes. The fastest approach:
```
1. Click the combobox to open it
2. Wait 500ms for options to render
3. Use browser_evaluate to list all options:
   document.querySelectorAll('[role="option"]').forEach(o => console.log(o.textContent))
4. Click the matching option by text:
   page.locator('span').filter({ hasText: 'EXACT_TEXT' }).click()
5. If multiple matches: use .nth(N) to select the right one
```

**Known dropdown values:**
- **Gender**: Male, Female, Decline to Self-Identify
- **Veteran Status**: Not a Protected Veteran, Protected Veteran, Declines to Self-Identify
- **Disability Category**: "Not applicable" (for "I do not want to answer")
- **Salary**: Pick range matching role level (e.g., "$100,000 - $124,999" for mid-level)

### Yes/No Button Groups
```
- These render as `<button>` with name "Yes" or "No"
- Multiple Yes/No groups on page — use .nth(N) to target correct one
- Common ordering:
  1. "Have you previously worked at [Company]?" → No
  2. "Are you legally authorized to work?" → Yes (if auth without sponsorship) or No
  3. "Will you now or in the future require sponsorship?" → Yes
- After clicking "Yes", ALWAYS check for follow-up text fields (e.g., "If yes, please specify")
```

### Follow-up "If yes, please specify" Fields
```
- Appear dynamically after selecting "Yes" on a question
- Wait 500ms after Yes click, then snapshot to find new text fields
- Fill with: "H-1B visa holder requiring sponsorship"
- These are often marked as required — missing them causes submit failure
```

### File Upload (Resume + Cover Letter)
```
1. Click the label "Upload Resume" or "Upload Cover Letter"
2. This triggers a file chooser modal
3. Use browser_file_upload with the file path
4. Wait for upload confirmation (filename appears on page)
```

### Contact Info
- Usually pre-filled if returning user
- Fields: First Name, Last Name, Email, Phone, Address
- Title/Prefix dropdown (Mr./Ms./etc.) — optional, use "Mr." if required

### Diversity / EEO Section
- Ethnicity: Click "Asian" text directly
- Gender: Combobox → "Male"
- Disability: Radio/checkbox "I do not want to answer" + Category combobox → "Not applicable"
- Veteran: Combobox → "Not a Protected Veteran"

### E-Signature
```
- Text input at bottom of form
- Type full legal name: full name from user-profile.md
- Date field usually auto-filled
```

### Submit
```
1. Click "Submit" button (usually at bottom)
2. May show confirmation page or redirect to "My Applications"
3. Verify: check page title or URL for "confirmation" / "My Applications"
4. Status on portal often shows "Under Consideration"
```

## Common Pitfalls
- **Combobox snapshots are huge** — Oracle Redwood renders deep DOM trees. Use `browser_snapshot` with `depth` limit or `browser_evaluate` to read options
- **Multiple "Yes"/"No" buttons** — Always use `.nth(N)` or `.first()` to target the correct group
- **Dynamic follow-up fields** — Wait after Yes/No selection before proceeding
- **"Category" dropdown under Disability** — This is separate from the disability radio; it's the ADA category. Select "Not applicable"
- **Slow page loads** — Oracle Cloud pages are heavy; wait 2-3s after navigation before interacting
