# SAP SuccessFactors ATS Handler

## Detection
- URL: `career*.sapsf.com`, `*.successfactors.com`

## Architecture
- Enterprise Java app, traditional HTML forms
- Always requires account creation/login
- Multi-page wizard with many sections

## Login Flow
1. Must register first — no guest option
2. Register with default credentials (email + password)
3. After registration, login and navigate to the job posting to apply

## Form Filling Strategy

### Text Inputs
- Standard `browser_fill_form` works
- Fields may have character limits — check maxlength

### Dropdowns
- Standard HTML `<select>` — use `browser_select_option`
- Some cascading (Country → State)

### File Upload
- Find file input → `browser_file_upload`
- May have separate upload buttons for resume vs cover letter

### Multi-page Navigation
- "Next" / "Continue" / "Save and Continue" buttons between sections
- Check for validation errors before proceeding to next page

### Common Issues
- Session timeout — if idle too long, may need to re-login
- Required fields not obvious — check for asterisk (*) markers
