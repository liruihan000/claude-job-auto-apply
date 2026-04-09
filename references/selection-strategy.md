# Job Selection Strategy

Read all criteria from config.json. Apply in order — reject early to save time.

## Filters

1. **Title**: Match `config.search.keywords`
2. **Level**: Include `config.search.level_include`, reject `config.search.level_exclude`
3. **Location**: Match `config.search.locations`
4. **Recency**: Prefer recent posts. Skip older than `config.search.max_age_days`
5. **Sponsorship**: Skip if `config.automation.skip_on_no_sponsorship` and JD contains ANY of:
   - "no sponsorship" / "cannot sponsor" / "unable to provide visa sponsorship" / "not able to sponsor"
   - "not eligible for sponsorship" / "sponsorship not available" / "does not offer sponsorship"
   - "must be authorized to work" / "must be legally authorized" / "no visa support"
   - "US citizen only" / "US citizens and permanent residents only" / "green card required"
   - "clearance required" / "security clearance"
   Read the FULL JD before deciding — do not rely on job title alone.
6. **Citizenship**: Skip if `config.automation.skip_on_citizenship_required` and JD requires US citizenship or permanent residency only
7. **Skills overlap**: Estimate overlap between JD requirements and the resume templates in `uploaded-resumes/`. Skip if below `config.search.min_skills_overlap`

## Prioritization

When multiple jobs pass filters, prioritize by:

1. **Competitive advantage signals** (highest weight — apply first):
   - JD mentions Mandarin / Chinese / bilingual → strong advantage (user is native Mandarin speaker)
   - JD mentions vibe coding / AI-assisted development / AI-native workflow / coding with AI tools → strong advantage
   - JD mentions both → highest priority of all
2. **Recency**: 24h > 3 days > 7 days
3. **ATS speed**: Indeed Smart Apply > LinkedIn Easy Apply > Greenhouse/Lever > Workday/Taleo/Oracle
4. **Skills overlap**: Higher overlap first
5. **Salary**: Do NOT filter by salary — low-salary roles may have less competition and are equally worth applying to
6. **Company size**: Larger companies more likely to sponsor
