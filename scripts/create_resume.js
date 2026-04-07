/**
 * Auto-Apply Skill: Resume Generator
 *
 * Usage: node create_resume.js <config.json> <output.docx>
 *
 * config.json should contain:
 * {
 *   "name": "Your Name",
 *   "contact": "City, State | 123-456-7890 | your.email@example.com",
 *   "linkedin": "https://linkedin.com/in/yourprofile",
 *   "github": "https://github.com/yourusername",
 *   "workAuth": "Work Authorization: H-1B Visa Holder  |  Languages: Mandarin (Native), English (Professional Fluency)",
 *   "summary": "Product-driven Full-Stack Engineer with 3+ years...",
 *   "skills": [
 *     { "category": "Full-Stack Development", "items": "Python, JavaScript, TypeScript..." },
 *     ...
 *   ],
 *   "experience": [
 *     {
 *       "company": "FlexTouch Technologies Co.",
 *       "location": "City, State",
 *       "title": "Software Engineer",
 *       "dates": "Jun 2024 – Present",
 *       "bullets": ["Built...", "Designed..."]
 *     },
 *     ...
 *   ],
 *   "projects": [
 *     {
 *       "name": "AI-powered RAG Platform Prototype (PlayWithRAG)",
 *       "title": "Full-Stack Developer & System Architect",
 *       "dates": "Oct 2025 – Dec 2025",
 *       "bullets": ["Built...", "Designed..."]
 *     }
 *   ],
 *   "education": [
 *     {
 *       "school": "Case Western Reserve University, Weatherhead School of Management",
 *       "location": "Cleveland, OH",
 *       "degree": "M.Sc., Business Analytics and Intelligence",
 *       "dates": "Sep 2022 – Jan 2024"
 *     },
 *     ...
 *   ]
 * }
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, TabStopType, ExternalHyperlink
} = require("docx");

// Right tab stop position = page width (12240) - left margin (720) - right margin (720) = 10800 twips
const RIGHT_TAB = 10800;

// --- Read config ---
const configPath = process.argv[2];
const outputPath = process.argv[3];

if (!configPath || !outputPath) {
  console.error("Usage: node create_resume.js <config.json> <output.docx>");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// --- Constants ---
const PAGE_WIDTH = 12240;
const PAGE_HEIGHT = 15840;
const MARGIN = 720; // 0.5 inch
const FONT = "Times New Roman";
const COLOR_BLACK = "000000";
const COLOR_DARK = "000000";
const COLOR_ACCENT = "000000";
const LINE_COLOR = "000000";

// --- Helpers ---
function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE_COLOR, space: 2 }
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true, size: 22, font: FONT, color: COLOR_ACCENT,
      }),
    ],
  });
}

function jobHeader(company, location, title, dates) {
  // Line 1: Company (bold left) + Dates (bold right)
  // Line 2: Title (italic left) + Location (italic right)
  return [
    new Paragraph({
      spacing: { before: 140, after: 0 },
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: [
        new TextRun({ text: company, bold: true, size: 20, font: FONT, color: COLOR_BLACK }),
        new TextRun({ text: "\t", font: FONT }),
        new TextRun({ text: dates, bold: true, size: 20, font: FONT, color: COLOR_BLACK }),
      ],
    }),
    new Paragraph({
      spacing: { before: 20, after: 40 },
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: [
        new TextRun({ text: title, italics: true, size: 20, font: FONT, color: COLOR_DARK }),
        new TextRun({ text: "\t", font: FONT }),
        new TextRun({ text: location, italics: true, size: 20, font: FONT, color: COLOR_DARK }),
      ],
    }),
  ];
}

function bulletPoint(text) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    indent: { left: 360, hanging: 180 },
    children: [
      new TextRun({ text: "\u2022  ", size: 20, font: FONT, color: COLOR_DARK }),
      new TextRun({ text: text, size: 20, font: FONT, color: COLOR_DARK }),
    ],
  });
}

function skillLine(category, skills) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    children: [
      new TextRun({ text: "• " + category + ": ", bold: true, size: 20, font: FONT, color: COLOR_BLACK }),
      new TextRun({ text: skills, size: 20, font: FONT, color: COLOR_DARK }),
    ],
  });
}

function eduLine(school, location, degree, dates) {
  return [
    new Paragraph({
      spacing: { before: 80, after: 0 },
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: [
        new TextRun({ text: school, bold: true, size: 20, font: FONT, color: COLOR_BLACK }),
        new TextRun({ text: "\t", font: FONT }),
        new TextRun({ text: dates, size: 20, font: FONT, color: COLOR_DARK }),
      ],
    }),
    new Paragraph({
      spacing: { before: 10, after: 40 },
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: [
        new TextRun({ text: degree, italics: true, size: 20, font: FONT, color: COLOR_DARK }),
        new TextRun({ text: "\t", font: FONT }),
        new TextRun({ text: location, italics: true, size: 20, font: FONT, color: COLOR_DARK }),
      ],
    }),
  ];
}

// --- Build Document ---
const children = [];

// Name
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 40 },
  children: [
    new TextRun({ text: config.name, bold: true, size: 40, font: FONT, color: COLOR_BLACK }),
  ],
}));

// Contact line with links
const contactChildren = [
  new TextRun({ text: config.contact + " | ", size: 18, font: FONT, color: COLOR_DARK }),
];
if (config.linkedin) {
  contactChildren.push(new ExternalHyperlink({
    children: [new TextRun({ text: "LinkedIn", style: "Hyperlink", size: 18, font: FONT })],
    link: config.linkedin,
  }));
  contactChildren.push(new TextRun({ text: " | ", size: 18, font: FONT, color: COLOR_DARK }));
}
if (config.github) {
  contactChildren.push(new ExternalHyperlink({
    children: [new TextRun({ text: "GitHub", style: "Hyperlink", size: 18, font: FONT })],
    link: config.github,
  }));
}
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 20 },
  children: contactChildren,
}));

// Work authorization
if (config.workAuth) {
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [
      new TextRun({ text: config.workAuth, size: 18, font: FONT, color: COLOR_DARK }),
    ],
  }));
}

// Summary
children.push(sectionHeader("Summary"));
children.push(new Paragraph({
  spacing: { before: 60, after: 80 },
  children: [
    new TextRun({ text: config.summary, size: 20, font: FONT, color: COLOR_DARK }),
  ],
}));

// Skills
children.push(sectionHeader("Technical Skills"));
for (const skill of config.skills) {
  children.push(skillLine(skill.category, skill.items));
}

// Experience
children.push(sectionHeader("Professional Experience"));
for (const exp of config.experience) {
  children.push(...jobHeader(exp.company, exp.location, exp.title, exp.dates));
  for (const bullet of exp.bullets) {
    children.push(bulletPoint(bullet));
  }
}

// Projects (optional)
if (config.projects && config.projects.length > 0) {
  children.push(sectionHeader("Relevant Project"));
  for (const proj of config.projects) {
    children.push(...jobHeader(proj.name, "", proj.title, proj.dates));
    for (const bullet of proj.bullets) {
      children.push(bulletPoint(bullet));
    }
  }
}

// Education
children.push(sectionHeader("Education"));
for (const edu of config.education) {
  children.push(...eduLine(edu.school, edu.location, edu.degree, edu.dates));
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 20, color: COLOR_DARK },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
        margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Resume saved to: " + outputPath);
});
