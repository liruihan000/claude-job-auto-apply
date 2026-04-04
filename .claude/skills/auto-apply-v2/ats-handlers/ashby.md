# Ashby ATS Handler

## Detection
- URL: `*.ashbyhq.com`, `jobs.ashbyhq.com`
- Often redirected from Indeed "Apply on company site"

## Architecture
- Modern React SPA, single-page form
- Clean, minimal UI — usually all fields on one page
- May have custom screening questions at bottom

## Form Filling Strategy

### Text Inputs
- `browser_fill_form` works well — standard controlled inputs
- Name, email, phone, location fields at top

### Location Field
- Often has autocomplete/typeahead — use `browser_type` with `slowly: true`
- Wait for dropdown to appear, then click the matching option
- Common format: "City, State, Country" (e.g. "Jersey City, NJ, USA")

### Resume Upload
- Click the upload area or "Attach" button → `browser_file_upload`
- Ashby may try to auto-parse resume — wait for "Analyzing resume" to finish before submitting

### Screening Questions
- Radio buttons, checkboxes, textareas — standard HTML
- Work authorization / sponsorship questions common
- Free-text questions for experience descriptions — generate concise answers from user-profile.md

### EEO / Voluntary Self-ID
- Gender, Race, Veteran, Disability dropdowns — use `browser_select_option`
- Disability section may require Name + Date signature if a status is selected

### Submission
- Single "Submit application" button at bottom
- Confirmation: page changes to show "Application submitted!" or "Success"
- URL changes to `/apply` → `/thanks`

### Common Issues
- File upload may show "File exceeds maximum size" error even for small files — retry once, if persists, try re-uploading
- Location autocomplete dropdown may disappear — click field, clear, retype slowly
