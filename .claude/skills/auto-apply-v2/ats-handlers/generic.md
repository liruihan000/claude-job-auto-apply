# Generic ATS Handler (Unknown Platform)

## When to use
- URL doesn't match any known ATS pattern
- Custom company career site

## Strategy

1. **Take snapshot** to see all interactive elements
2. **Look for Apply button** — may be "Apply", "Apply Now", "Submit Application", "Apply for this job"
3. **Identify form type**:
   - Single page with all fields → fill all at once
   - Multi-page wizard → fill each page, click Next/Continue
   - Modal/overlay → fill within the modal

## Form Filling

### Field Discovery
- Use `browser_snapshot` to get accessibility tree
- Match field labels to user profile data
- Common patterns: "First Name", "Last Name", "Email", "Phone", "Resume"

### File Upload
- Look for `<input type="file">`, "Upload", "Attach", "Choose File"
- Click the button → `browser_file_upload`
- Never try to type into file inputs

### Dropdowns
- Try `browser_select_option` first
- If custom dropdown (not `<select>`): click to open → find option in snapshot → click option

### Autocomplete Fields
- Use `browser_type` with `slowly: true`
- Wait for dropdown suggestions → click matching option

### Required Fields
- Look for asterisk (*), "Required", red borders
- Fill all of them before attempting submit

### Submit
- Pre-submit JS validation check
- Look for "Submit", "Apply", "Send Application", "Complete"
- Take screenshot before and after

## Common Issues
- CAPTCHA → return FAILED
- "Create account" required → register with default credentials
- Redirect to external ATS → identify the new platform and follow its handler
- iFrame embedding → use Playwright frame locator
