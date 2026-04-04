/**
 * Auto-Apply Skill: Cover Letter Generator
 *
 * Usage: node create_cover_letter.js <config.json> <output.docx>
 *
 * config.json should contain:
 * {
 *   "name": "Your Name",
 *   "contact": "City, State | 123-456-7890 | your.email@example.com",
 *   "date": "March 25, 2026",
 *   "recipient": {
 *     "name": "Hiring Manager",
 *     "company": "First Cover, Inc",
 *     "address": "New York, NY 10123"
 *   },
 *   "paragraphs": [
 *     "I am writing to express my strong interest in...",
 *     "At FlexTouch Technologies, I recently...",
 *     "As cofounder and AI engineer at Livins AI...",
 *     "I am authorized to work in the United States..."
 *   ]
 * }
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType
} = require("docx");

const configPath = process.argv[2];
const outputPath = process.argv[3];

if (!configPath || !outputPath) {
  console.error("Usage: node create_cover_letter.js <config.json> <output.docx>");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const FONT = "Calibri";
const COLOR = "333333";
const SIZE = 22; // 11pt

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 0, after: opts.after || 120 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: opts.size || SIZE,
        font: FONT,
        color: opts.color || COLOR,
        bold: opts.bold || false,
      }),
    ],
  });
}

const children = [
  // Header
  p(config.name, { size: 28, bold: true, after: 40 }),
  p(config.contact, { size: 20, after: 200 }),

  // Date
  p(config.date, { after: 200 }),

  // Recipient
  p(config.recipient.name, { after: 0 }),
  p(config.recipient.company, { after: 0 }),
  p(config.recipient.address, { after: 240 }),

  // Greeting
  p(`Dear ${config.recipient.name},`, { after: 200 }),
];

// Body paragraphs
for (const para of config.paragraphs) {
  children.push(new Paragraph({
    spacing: { after: 180 },
    children: [
      new TextRun({ text: para, size: SIZE, font: FONT, color: COLOR }),
    ],
  }));
}

// Sign off
children.push(p("Sincerely,", { before: 120, after: 40 }));
children.push(p(config.name, { bold: true, after: 0 }));

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: SIZE, color: COLOR } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Cover letter saved to: " + outputPath);
});
