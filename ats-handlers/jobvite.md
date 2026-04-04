# Jobvite ATS Handler

## Detection
- URL: `*.jobvite.com`, `jobs.jobvite.com`

## Architecture
- Multi-page form (Personal Info → EEO → Confirmation)
- Standard HTML forms, not React
- May require country-based data consent selection first

## Form Filling Strategy

### Page 1: Application Form
- **Data consent**: Select "United States" when asked about location for data processing
- **Resume + Cover Letter**: Click file input → `browser_file_upload`, upload both
- **Personal info**: Name, address, phone, email — standard `browser_fill_form`
- **Dropdowns**: Employment type, education level, salary range, sponsorship — use `browser_select_option`
- **Checkboxes**: Age 18+, willing to relocate, application acknowledgement — click directly
- **How did you hear**: Select "Indeed" or appropriate source

### Page 2: EEO
- Gender, Hispanic/Latino (Yes/No), Race, Veteran, Disability — all dropdowns
- Each section may have Name + Date signature fields
- Fill name as full name from user-profile.md, date as today in MM/DD/YYYY

### Submission
- "Send Application" button on last page
- Confirmation shows "Application Sent!"

### Common Issues
- Address field may need full format (street, city, state, zip on separate fields)
- Salary range is usually a dropdown with pre-set ranges — pick the one matching JD salary
- "Application Acknowledgement" checkbox is required — must check before submit
