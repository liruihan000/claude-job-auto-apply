# Resume Template Selection Guide

## Location

Templates are stored in `templates/` (in your project root).

## How It Works

Place one or more `.docx` resume files in the templates folder. The agent selects the best match for each job based on the JD keywords.

If you only have one template, the agent uses it for everything and tailors the content per JD.

## Recommended Template Strategy

Create templates by target role direction. Name them descriptively:

| Template name | Best for JDs mentioning... |
|---------------|---------------------------|
| `fullstack-ai.docx` | React, Next.js, full-stack, AI, LLM, startup |
| `backend.docx` | Backend, APIs, microservices, distributed systems |
| `platform-infra.docx` | Platform, DevOps, SRE, K8s, Terraform |
| `ai-ml-infra.docx` | ML infra, MLOps, AI platform, model serving, RAG |
| `general-swe.docx` | Generic SWE, unclear specialization |

## How the Agent Tailors

For each application, the agent:

1. **Selects template** — picks the closest match based on JD keywords
2. **Rewrites summary** — 2-3 sentences mirroring the job posting
3. **Mirrors keywords** — extracts top 10-15 from JD, ensures each appears in resume
4. **Reorders experiences** — most relevant role first
5. **Cherry-picks bullets** — 3-4 most relevant per role
6. **Adjusts skills section** — reorders so most relevant category leads
7. **Includes/excludes roles** — based on relevance and space
8. **Verifies 1-page fit** — cuts least relevant content if overflow

## Tips

- Each template should represent a different **angle**, not different content
- Same experience pool, different emphasis and ordering
- The agent handles the tailoring — you provide the raw material
