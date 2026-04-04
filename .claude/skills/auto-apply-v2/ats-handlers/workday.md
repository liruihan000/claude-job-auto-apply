# Workday ATS Handler

## Detection
- URL: `*.myworkdayjobs.com`, `*.wd1.myworkdayjobs.com`, `*.wd5.myworkdayjobs.com`
- DOM: `[data-automation-id]` attributes, `wd-` CSS class prefixes

## Architecture
- React SPA with controlled form components
- Form state managed by React — direct DOM value changes may not register
- Multi-page wizard flow (My Information → My Experience → Application Questions → Review)

## Form Filling Strategy

### Text Inputs
```
1. Use `browser_fill_form or browser_type` tool with the field's ref (preferred method)
2. If browser_fill_form or browser_type doesn't work:
   a. Click the field (triple_click to select all existing text)
   b. Type the new value
   c. Press Tab to trigger onBlur validation
3. Verify: re-read the field to confirm value was accepted
```

### Dropdowns (data-automation-id="select")
```
1. Click the dropdown to open it
2. Wait 0.5s for options to render
3. Use browser_snapshot to find the options list
4. If searchable: type in the search box to filter
5. Click the desired option
6. Verify selection was registered
```

### Date Fields
```
- Format: MM/DD/YYYY (US standard)
- Clear existing value first (triple_click + type)
- Type the date string directly
- Tab out to validate
```

### Multi-Checkbox Fields
```
1. Read all checkbox options via browser_snapshot
2. Click each relevant checkbox
3. Verify checked state
```

### File Upload (Resume)
```
1. Find the upload section (usually data-automation-id="file-upload")
2. Locate the <input type="file"> element via browser_snapshot tool
3. Use browser_file_upload tool with the ref — NEVER click the input
4. Wait for upload to complete (check for filename appearing)
5. Verify file was accepted
```

### Work Experience Section
```
- Workday often pre-populates from parsed resume
- If auto-parsed: verify and correct entries
- If manual entry needed:
  1. Click "Add" to create new entry
  2. Fill: Job Title, Company, Location, Start Date, End Date, Description
  3. For current job: check "I currently work here"
```

### Education Section
```
- Similar to Work Experience — may auto-populate from resume
- Fields: School, Degree, Field of Study, GPA (optional), Start/End Date
```

## Multi-Page Navigation
```
Pages typically flow:
1. My Information (contact, address)
2. My Experience (resume upload, work history, education)
3. Application Questions (screening questions, EEO)
4. Review & Submit

Navigate: Click "Next" or "Continue" button at bottom
Back: Click "Previous" or "Back" if needed
Save: Some Workday instances have "Save for Later"
```

## Common Pitfalls
- Workday's native "Autofill with resume" often parses poorly — prefer manual fill
- Some Workday instances require account creation via "Create Account" flow
- Address fields may have autocomplete — type slowly, wait for suggestions
- Country/State dropdowns load dynamically — wait after selecting Country before selecting State
- File upload may have size limits (usually 5MB) — ensure PDF is within limits
