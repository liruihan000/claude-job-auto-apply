# Job Search Guide

Read `config.search.platforms` to determine which platforms to search. Search all enabled platforms in parallel.

## Platform Methods

### Indeed
- **Via MCP** (preferred): Use `mcp__claude_ai_Indeed__search_jobs` with config keywords/locations
- **Via Playwright** (fallback): Navigate to `indeed.com/jobs`, enter keywords and location, scrape results
- Supports: keywords, location, job_type, date posted filter
- Pagination: scroll or click "Next" to load more results

### LinkedIn
- **Via Playwright**: Navigate to `linkedin.com/jobs/search/`, enter keywords and location
- Login may be required (use credentials from `references/secrets.md`)
- Filter by: Easy Apply, date posted, experience level
- Pagination: scroll to load more
- Note: LinkedIn has aggressive bot detection — use persistent profile, avoid rapid actions

### Glassdoor
- **Via Playwright**: Navigate to `glassdoor.com/Job/`, enter keywords and location
- May require login/account
- Filter by: date posted, company rating, salary estimate
- Pagination: click page numbers

### ZipRecruiter
- **Via Playwright**: Navigate to `ziprecruiter.com/jobs-search`, enter keywords and location
- Filter by: date posted, salary, distance
- Often has "Quick Apply" (similar to Indeed Smart Apply)

### Google Jobs
- **Via Playwright**: Navigate to `google.com/search?q={keywords}+jobs+{location}&ibp=htl;jobs`
- No login needed
- Aggregates from multiple sources (Indeed, LinkedIn, Glassdoor, company sites)
- Filter by: date posted, type, distance
- Click through to original posting for apply link

### Direct Company Career Pages
- **Via Playwright**: Navigate directly to known company career URLs
- Common ATS portals: `*.myworkdayjobs.com`, `*.greenhouse.io`, `*.lever.co`, `boards.greenhouse.io/*`
- Useful for targeting specific companies

## Search Flow

```
For each platform in config.search.platforms:
    1. Search with each keyword × location combination
    2. Filter results by config.search criteria (level, recency, etc.)
    3. Deduplicate across platforms (same job may appear on multiple boards)
    4. Score per references/selection-strategy.md
    5. Add passing jobs to TRACKER.md as ⬜
```

## Deduplication

Jobs often appear on multiple platforms. Deduplicate by:
1. Company name + role title (fuzzy match)
2. If same job found on multiple platforms, prefer the fastest ATS (Indeed > LinkedIn > Greenhouse > Workday)

## Rate Limiting

- Don't search too aggressively — add small delays between requests
- If a platform blocks or shows CAPTCHA, skip it and move to next
- Indeed MCP has built-in rate limiting, no extra handling needed
