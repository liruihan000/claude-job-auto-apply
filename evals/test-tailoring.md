# Eval: Resume Tailoring Quality

## Test Scenario

Run this eval to verify resume tailoring produces high-quality, JD-specific output.

### Input

**Fake JD:**
```
Software Engineer II — Backend (Python/Go)
Company: Acme Payments Inc.
Location: New York, NY

We're looking for a backend engineer to build scalable payment processing APIs.

Requirements:
- 3+ years Python or Go
- Experience with PostgreSQL and Redis
- RESTful API design
- Docker, Kubernetes
- CI/CD pipelines
- Experience with distributed systems

Nice to have:
- Financial systems experience
- Event-driven architecture
- Observability (Prometheus, Grafana)
```

### Run

```
/job-auto-apply prepare Acme Payments — Software Engineer II Backend
```

Or manually invoke the Prepare subagent with this JD.

### Expected Output

Check the generated `resume.md`:

| Criteria | Pass? |
|----------|-------|
| Summary mentions "backend", "payment", "APIs" | |
| Skills section leads with Python, Go, PostgreSQL | |
| Keywords present: Docker, Kubernetes, CI/CD, distributed systems, Redis | |
| Most relevant role listed first | |
| Bullets have quantifiable metrics | |
| No fabricated experience | |
| Fits 1 page | |
| No tables/images/complex formatting | |

Check the generated `cover_letter.md`:

| Criteria | Pass? |
|----------|-------|
| Mentions "Acme Payments" by name | |
| References payment/financial systems | |
| Not generic — specific to this JD | |
| 250-400 words | |

### Keyword Match Score

Count JD keywords found in resume:
- Python, Go, PostgreSQL, Redis, REST API, Docker, Kubernetes, CI/CD, distributed systems, financial, event-driven, Prometheus, Grafana

Target: 80%+ (≥10 out of 13)
