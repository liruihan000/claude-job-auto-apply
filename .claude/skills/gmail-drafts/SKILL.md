---
name: gmail-drafts
description: |
  Guidelines for creating Gmail drafts via the Gmail MCP tool. Use this skill whenever creating, editing, or sending email drafts through gmail_create_draft. Covers critical formatting issues like Gmail's content folding/collapsing behavior that can hide parts of the email body from recipients. MANDATORY for any email draft creation task.
---

# Gmail Draft Creation — Known Issues & Best Practices

## Critical Issue: Gmail Content Folding

Gmail automatically folds (collapses behind "..." dots) parts of an email when it detects content that looks like quoted or repeated text. This happens especially in thread replies.

### What causes folding

- Paragraph breaks that create visual separation between content blocks — Gmail may interpret the second block as "quoted content" and collapse it
- The `gmail_create_draft` tool with `threadId` parameter creates in-thread replies, which are more prone to folding
- Long emails with multiple paragraphs separated by blank lines
- Content patterns that resemble email signatures or quoted replies

### How to prevent folding

1. **Keep paragraphs tightly connected.** Avoid isolated short sentences on their own line (like "I'm excited about the opportunity...") followed by a blank line and then more content. Gmail may fold everything after such a break.

2. **Merge related thoughts into single paragraphs.** Instead of:
   ```
   I've been leading LLM deployment at FlexTouch. I'm excited about the

   opportunity to bring that experience to your team.
   ```
   Write:
   ```
   I've been leading LLM deployment at FlexTouch, and I'm excited about the opportunity to bring that experience to your team.
   ```

3. **Test with a new draft (no threadId) first** if the email is important. Thread replies are more prone to folding.

4. **Use contentType: "text/html"** for more control over formatting if plain text keeps getting folded.

5. **Keep follow-up emails short** — 2-3 paragraphs max. The shorter the email, the less likely Gmail will fold any part of it.

### Pre-send checklist

Before telling the user the draft is ready:

- Warn the user that Gmail may fold content in thread replies
- Suggest the user preview the draft in Gmail and check for "..." before sending
- If the email is critical, offer to create it as a standalone email (no threadId) instead of an in-thread reply

## General Email Drafting Rules

- Always let the user review and confirm before sending
- Never auto-send without explicit user approval
- Keep professional emails concise — under 150 words for follow-ups
- Match the tone of the existing thread
- When replying in a thread, don't repeat information already in the thread
