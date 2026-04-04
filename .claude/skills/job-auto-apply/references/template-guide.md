# Resume Template Library

## Location

Templates are stored at `Career/Basic/templates/` in the user's workspace folder.

## Available Templates

| File               | Target Roles                                        | Key Differentiators                                      |
|--------------------|-----------------------------------------------------|----------------------------------------------------------|
| `fullstack-ai`     | Full-stack, AI engineer, startup, LLM roles          | Includes S&Y BI experience, broadest coverage            |
| `backend`          | Backend engineer, distributed systems, APIs          | GCP metrics (p99 <150ms), microservices focus             |
| `platform-infra`   | Platform, infrastructure, DevOps, SRE, K8s           | Terraform, K8s, observability stack, MTTR metrics        |
| `ai-ml-infra`      | AI/ML infrastructure, MLOps, model serving           | RAG pipelines, LLM serving, vector DBs, embedding focus  |
| `general-swe`      | Generic SWE, unclear specialization                  | Balanced, no specific tilt                               |

Each template has both `.docx` and `.pdf` versions.

## Selection Guide

| Job description mentions...                          | Start with       |
|------------------------------------------------------|------------------|
| React, Next.js, full-stack, AI, LLM, startup         | `fullstack-ai`   |
| Backend, APIs, microservices, distributed systems     | `backend`        |
| Platform, infrastructure, DevOps, SRE, K8s, Terraform | `platform-infra` |
| ML infra, MLOps, AI platform, model serving, RAG      | `ai-ml-infra`    |
| Generic SWE, unclear specialization                   | `general-swe`    |

## Key Differences Between Templates

### Summary positioning
- `fullstack-ai`: Full-stack + AI, startup cofounder angle
- `backend`: Backend engineer, distributed systems, high-concurrency
- `platform-infra`: Platform engineer, cloud-native, reliability
- `ai-ml-infra`: AI/ML infrastructure, production ML systems
- `general-swe`: Backend/platform-focused, broad

### Skills section order
Each template leads with the most relevant skill category for its target roles.

### Livins AI title
- `fullstack-ai`: "AI Engineer (Cofounder)"
- `backend`: "Founding AI Engineer (part-time)"
- `platform-infra`: "Founding AI Engineer"
- `ai-ml-infra`: "Founding Engineer & Technical Lead"
- `general-swe`: "Founding Software Engineer (Cofounder)"

### S&Y Technology inclusion
Only `fullstack-ai` includes S&Y Technology by default. Other templates omit it for space.

### Metrics emphasis
- `backend` and `platform-infra` have GCP-specific metrics (p99 latency, MTTR, 99.9% uptime, Terraform IaC)
- `ai-ml-infra` has ML-specific metrics (hallucination reduction, data integrity percentages)
- `fullstack-ai` and `general-swe` have general engineering metrics

## Application Filing Structure

After each application, save tailored materials to:

```
Career/Basic/applications/YYYY-MM-DD_CompanyName_RoleShorthand/
├── resume.pdf
├── resume.docx
├── cover_letter.pdf
├── cover_letter.docx
└── notes.md
```
