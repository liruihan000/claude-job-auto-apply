#!/usr/bin/env node

/**
 * ATS Parse Check — based on OpenResume's PDF parser validation rules
 *
 * Usage: node ats_parse_check.js <resume.pdf>
 *
 * Validates that a PDF resume can be correctly parsed by ATS systems.
 * Checks: section detection, contact info formats, standard headings,
 * single-column layout, bullet points, date formats.
 *
 * Output: JSON with pass/fail status, issues found, and recommendations
 *
 * Requires: pdfjs-dist (npm install pdfjs-dist)
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error('Usage: node ats_parse_check.js <resume.pdf>');
    process.exit(1);
  }

  // Dynamic import for pdfjs-dist (ESM compatible)
  let pdfjsLib;
  try {
    pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  } catch (e) {
    console.error('Error: pdfjs-dist not installed. Run: npm install pdfjs-dist');
    process.exit(1);
  }

  const issues = [];
  const passed = [];

  // --- Step 1: Extract text items from PDF ---
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

  const pageCount = doc.numPages;
  if (pageCount > 1) {
    issues.push({ severity: 'warning', rule: 'page-count', message: `Resume is ${pageCount} pages (should be 1)` });
  } else {
    passed.push('page-count');
  }

  const textItems = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (item.str && item.str.trim()) {
        textItems.push({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height,
          fontName: item.fontName || '',
        });
      }
    }
  }

  const fullText = textItems.map(t => t.text).join(' ');
  const lines = [];
  let currentLine = [];
  let lastY = null;

  for (const item of textItems) {
    if (lastY !== null && Math.abs(item.y - lastY) > 3) {
      if (currentLine.length) lines.push(currentLine);
      currentLine = [];
    }
    currentLine.push(item);
    lastY = item.y;
  }
  if (currentLine.length) lines.push(currentLine);

  // --- Step 2: Check section headings ---
  const SECTION_KEYWORDS = [
    'experience', 'education', 'project', 'skill', 'summary',
    'objective', 'award', 'honor', 'certification', 'volunteer',
  ];

  const foundSections = [];
  const requiredSections = ['experience', 'education', 'skill'];

  for (const line of lines) {
    const lineText = line.map(t => t.text).join(' ').trim();
    const lineTextLower = lineText.toLowerCase();

    for (const keyword of SECTION_KEYWORDS) {
      if (lineTextLower.includes(keyword)) {
        foundSections.push({ keyword, text: lineText, itemCount: line.length });
        break;
      }
    }
  }

  for (const req of requiredSections) {
    if (!foundSections.find(s => s.keyword === req)) {
      issues.push({ severity: 'error', rule: 'missing-section', message: `Missing required section: "${req}"` });
    }
  }

  // Check if section titles are on their own line (1-2 items max)
  for (const section of foundSections) {
    if (section.itemCount > 3) {
      issues.push({
        severity: 'warning', rule: 'section-title-format',
        message: `Section "${section.text}" may not be on its own line (${section.itemCount} items) — ATS may miss it`,
      });
    }
  }

  if (foundSections.length >= 3) {
    passed.push('section-headings');
  }

  // --- Step 3: Check contact info formats ---
  const emailRegex = /\S+@\S+\.\S+/;
  const phoneRegex = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const locationRegex = /[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/;

  if (emailRegex.test(fullText)) {
    passed.push('email-format');
  } else {
    issues.push({ severity: 'error', rule: 'email-format', message: 'No valid email found (expected: name@domain.com)' });
  }

  if (phoneRegex.test(fullText)) {
    passed.push('phone-format');
  } else {
    issues.push({ severity: 'warning', rule: 'phone-format', message: 'No standard phone number found (expected: (xxx) xxx-xxxx or xxx-xxx-xxxx)' });
  }

  if (locationRegex.test(fullText)) {
    passed.push('location-format');
  } else {
    issues.push({ severity: 'warning', rule: 'location-format', message: 'No standard location found (expected: City, ST)' });
  }

  // --- Step 4: Check date formats ---
  const yearRegex = /(?:19|20)\d{2}/g;
  const yearMatches = fullText.match(yearRegex);
  if (yearMatches && yearMatches.length >= 2) {
    passed.push('date-format');
  } else {
    issues.push({ severity: 'warning', rule: 'date-format', message: 'Few or no standard dates found (expected: YYYY format)' });
  }

  // --- Step 5: Check bullet points ---
  const bulletChars = ['•', '⋅', '∙', '●', '○', '⦁', '◦', '-'];
  const hasBullets = bulletChars.some(b => fullText.includes(b));
  if (hasBullets) {
    passed.push('bullet-points');
  } else {
    issues.push({ severity: 'warning', rule: 'bullet-points', message: 'No bullet points detected — ATS may not parse description items correctly' });
  }

  // --- Step 6: Check for problematic formatting ---
  // Tables/columns detection: check if X positions vary widely on same Y
  const xPositions = textItems.map(t => Math.round(t.x / 50) * 50); // bucket by 50px
  const uniqueXBuckets = new Set(xPositions);
  if (uniqueXBuckets.size > 4) {
    issues.push({ severity: 'warning', rule: 'multi-column', message: 'Possible multi-column layout detected — ATS may scramble text order' });
  } else {
    passed.push('single-column');
  }

  // Check for images (no text items but pages exist)
  if (textItems.length < 20) {
    issues.push({ severity: 'error', rule: 'low-text', message: `Only ${textItems.length} text items found — resume may be image-based or heavily formatted` });
  }

  // --- Step 7: Check for stray markdown/formatting characters ---
  const markdownPatterns = [
    { pattern: /(?:^|\s)\*[^*\s].*?[^*\s]\*(?:\s|$)/m, label: 'Markdown italic (*text*)' },
    { pattern: /(?:^|\s)\*\*[^*].*?[^*]\*\*(?:\s|$)/m, label: 'Markdown bold (**text**)' },
    { pattern: /(?:^|\s)#{1,3}\s/m, label: 'Markdown heading (#)' },
    { pattern: /(?:^|\s)```/m, label: 'Markdown code block (```)' },
  ];

  for (const { pattern, label } of markdownPatterns) {
    if (pattern.test(fullText)) {
      issues.push({ severity: 'error', rule: 'stray-markdown', message: `Found ${label} in PDF text — rendering issue` });
    }
  }
  if (!markdownPatterns.some(({ pattern }) => pattern.test(fullText))) {
    passed.push('no-stray-markdown');
  }

  // --- Output ---
  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;

  const result = {
    status: errors > 0 ? 'FAIL' : warnings > 0 ? 'WARN' : 'PASS',
    errors,
    warnings,
    passed: passed.length,
    issues,
    passed_checks: passed,
    summary: `${passed.length} passed, ${errors} errors, ${warnings} warnings`,
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
