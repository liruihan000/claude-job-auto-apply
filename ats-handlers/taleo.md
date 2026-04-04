# Taleo ATS Handler

## Detection
- URL: `*.taleo.net`
- Page title often contains "Sign In", "Privacy Agreement", or company name

## Architecture
- Oracle Taleo — enterprise Java app, traditional HTML forms
- Multi-page wizard (Privacy Agreement → Login → Resume → Contact → Experience → Questions → Demographics → Voluntary Self ID → eSignature → Review → Submit)
- Uses JSF (JavaServer Faces) — form IDs are long and auto-generated
- May have iFrames for disability self-identification forms

## Login Flow
1. Often requires account — try "Apply as Guest" first (fastest)
2. If guest not available, register with default credentials
3. Guest flow sends email with username/password — check Gmail MCP
4. Use "Forgot User Name" if needed — sends username via email

## Form Filling Strategy

### Text Inputs
- Standard `browser_fill_form` works for most fields
- Long auto-generated IDs — use `browser_snapshot` to find refs

### Dropdowns
- Standard HTML `<select>` — use `browser_select_option`
- Some cascading dropdowns (Country → State → City) — select parent first, wait for child to load, then select child
- Use `browser_evaluate` if standard select doesn't trigger cascade:
  ```js
  element.value = 'value'; element.dispatchEvent(new Event('change', {bubbles: true}));
  ```

### File Upload
- Click "Select the file to attach" → `browser_file_upload`
- Then click "Attach" button
- After upload, check "Resume" checkbox to mark which file is the resume

### Screening Questions
- Radio buttons for Yes/No — click directly
- "Yes" answers often require follow-up explanation textarea (hidden until Yes selected)
- Fill explanation via `browser_evaluate` targeting the textarea by partial ID

### Voluntary Self ID (Disability)
- Often in an iFrame — use Playwright's frame locator
- Requires: Name, Date (MM/DD/YY format), checkbox selection
- If selecting any disability option, name and date become required

### eSignature
- Text field for full name — fill with full name from user-profile.md
- No date field usually, just the name

### Common Issues
- "Cookies not enabled" warning — can usually ignore, doesn't block submission
- Cascading dropdowns need parent selected first, then wait for child options to load
- Page navigation uses form submission, not standard links — click buttons, don't try to navigate directly
