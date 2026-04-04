# Greenhouse ATS Handler

## Detection
- URL: `boards.greenhouse.io/*`, `jobs.greenhouse.io/*`
- DOM: `#grnhse_app`, `class="grnhse-*"`
- Some companies embed Greenhouse in their own domain — check for `grnhse` in HTML source

## Architecture
- React components for dropdowns and custom fields
- Generally simpler than Workday — often single-page form
- Embedded forms (iFrame on company site) vs hosted forms (boards.greenhouse.io)

## Form Filling Strategy

### Text Inputs (name, email, phone, LinkedIn, etc.)
```
1. Use browser_fill_form or browser_type tool — works well for standard fields
2. Fields are usually clearly labeled
3. LinkedIn and Website fields: paste full URL
```

### Custom Dropdowns
```
1. Click the dropdown trigger (usually a div, not native <select>)
2. Wait for options to render
3. If search box appears: type to filter
4. Click the desired option
5. Note: Some dropdowns close after selection, some don't — verify
```

### Address/Location Fields
```
- May use Google Places autocomplete
- Type city name slowly, wait 1-2s for suggestions
- Select from dropdown
- If no autocomplete: fill City, State, ZIP separately
```

### File Upload
```
1. Find the upload area — usually has "Attach" or "Choose File" text
2. Locate <input type="file"> — may be hidden, use browser_snapshot tool
3. browser_file_upload with ref
4. Wait for upload confirmation (filename + file size shown)
```

### Cover Letter
```
- Often a separate file upload area below resume
- Some have a textarea instead — check which format
- If textarea: paste cover letter text (abbreviated version)
```

### Custom Questions
```
- Greenhouse custom questions appear at bottom of form
- Types: text, textarea, dropdown, checkbox, yes/no
- Read each question label carefully
- For open-ended: generate response using AI + user profile
- For dropdown: browser_snapshot to get all options, select best match
```

## EEO (Equal Employment Opportunity) Section
```
Common fields:
- Gender: [Decline to Self Identify] unless user specifies
- Race/Ethnicity: [Decline to Self Identify]
- Veteran Status: [I am not a veteran]
- Disability: [I don't wish to answer]

Note: These are always optional by law. Selecting "Decline" is always safe.
```

## Submission
```
1. Review all filled fields
2. Click "Submit Application" button
3. Confirmation page usually shows "Application submitted" message
4. Screenshot for records
```

## Common Pitfalls
- Embedded Greenhouse forms on company sites may be inside iFrames
- Some companies have custom CSS that changes element layout
- Required field indicators (*) may not be consistent
- Phone number format validation varies — try: (216) 543-2868 or 216-543-2868
