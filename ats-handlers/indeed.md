# Indeed Smart Apply Handler

## Detection
- URL: `indeed.com/viewjob*`, `m5.apply.indeed.com/*`
- Look for "Apply now" or "Apply on Indeed" button (vs "Apply on company site" which redirects)

## Architecture
- Indeed's own overlay/modal form
- Multi-step (usually 2-4 screens)
- Contact info often pre-filled from Indeed profile

## Important: Direct Apply vs External

Check the apply button text:
- **"Apply now"** / **"Apply on Indeed"** → Indeed Smart Apply (automatable)
- **"Apply on company site"** → Redirects to external portal (use appropriate ATS handler)

## Login Strategy (IMPORTANT)

**DO NOT use "Continue with Google" button.** It opens a popup window that Playwright cannot interact with, or redirects to Chrome sync flow instead of Indeed OAuth. This wastes many cycles.

**Preferred login flow:**
1. Fill email in the "Email address" field
2. Click "Continue" button
3. Indeed will either:
   a. Ask for password → fill password, click Continue
   b. Send a verification code → use Gmail MCP to read the code
   c. Auto-login if session is cached (check if redirected back to job page)
4. If password login fails, try "Sign in with a code instead" link

**If already logged in** (persistent profile): The "Apply" button goes straight to Smart Apply form — no login needed.

## Form Filling Strategy

### Screen 1: Contact Information
```
- Usually pre-filled if user has Indeed account
- If not: fill name, email, phone
- browser_fill_form or browser_type works for all fields
```

### Screen 2: Resume
```
1. Indeed may show previously uploaded resumes
2. If existing resume shown: check if it's the right one
3. To upload new: find "Upload resume" or file input
4. browser_file_upload with ref — NEVER click the file input directly
5. Wait for upload to complete
```

### Screen 3: Additional Questions
```
- Screening questions from the employer
- Types: yes/no, multiple choice, free text
- Common: work authorization, experience years, willing to relocate
- Answer using AI + user profile mapping
```

### Screen 4: Review & Submit
```
1. Review all filled information
2. Screenshot for user review
3. "Submit your application" button
4. CONFIRM with user before clicking
```

## Cover Letter
```
- Indeed Smart Apply often does NOT support cover letter upload — this is normal
- If "Add a cover letter" or "Add supporting documents" option exists: click to expand, upload
- If no option visible: skip cover letter — do not waste time looking for it
- Note this in STATUS.md: "Cover letter prepared but not uploaded — Indeed Smart Apply limitation"
```

## Common Pitfalls
- Indeed's overlay can be slow to load — wait 2s after clicking Apply
- "Smart Apply" may pre-fill with outdated information — verify before submit
- Some questions have character limits — keep answers concise
- "Apply on company site" jobs cannot use this handler — detect and switch
- Indeed rate-limits rapid applications — space out batch applies
