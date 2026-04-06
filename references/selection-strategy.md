# Job Selection Strategy

Read all criteria from config.json. Apply in order — reject early to save time.

## Filters

1. **Title**: Match `config.search.keywords`
2. **Level**: Include `config.search.level_include`, reject `config.search.level_exclude`
3. **Location**: Match `config.search.locations`
4. **Recency**: Prefer recent posts. Skip older than `config.search.max_age_days`
5. **Sponsorship**: Skip if `config.automation.skip_on_no_sponsorship` and JD says "no sponsorship" / "US citizen only" / "clearance required"
6. **Citizenship**: Skip if `config.automation.skip_on_citizenship_required` and JD requires US citizenship
7. **Skills overlap**: Estimate overlap between JD requirements and the resume templates in `uploaded-resumes/`. Skip if below `config.search.min_skills_overlap`

## Prioritization

When multiple jobs pass filters, prioritize by:

1. **Recency**: 24h > 3 days > 7 days
2. **ATS speed**: Indeed Smart Apply > LinkedIn Easy Apply > Greenhouse/Lever > Workday/Taleo/Oracle
3. **Skills overlap**: Higher overlap first
4. **Company size**: Larger companies more likely to sponsor
