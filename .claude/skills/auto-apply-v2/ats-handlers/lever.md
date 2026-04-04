# Lever ATS Handler

## Detection
- URL: `jobs.lever.co/*`
- DOM: `.lever-application`, `.lever-application-form`

## Architecture
- Traditional HTML forms (NOT React controlled)
- Simplest of the major ATS platforms
- Usually single-page application form

## Form Filling Strategy

### All Text Fields
```
- Standard browser_fill_form or browser_type works perfectly
- Fields: Full Name, Email, Phone, Current Company, LinkedIn, GitHub/Portfolio
- No special React handling needed
```

### Resume Upload
```
1. Find file input (usually labeled "Resume/CV")
2. browser_file_upload with ref
3. Lever accepts PDF, DOCX, TXT
```

### Cover Letter
```
- Usually a textarea field
- Paste a concise version (3-4 paragraphs)
- Or upload as file if file input is available
```

### Additional Information
```
- Free-text textarea at the bottom
- Optional — can leave blank or add brief note about visa status
```

### Custom Questions
```
- Simple form fields at bottom
- Text inputs and dropdowns use standard HTML
- browser_fill_form or browser_type works for all types
```

## Submission
```
1. Single "Submit Application" button at bottom
2. Very straightforward — no multi-page wizard
3. Confirmation message appears on same page
```

## Common Pitfalls
- Some companies customize Lever's CSS heavily — element positions may vary
- File upload area may look like a drag-and-drop zone — still has hidden file input
- Lever doesn't usually require account creation
