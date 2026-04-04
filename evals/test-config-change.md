# Eval: Config Changes Apply Correctly

## Test Scenarios

Verify that changing `config.json` values actually changes agent behavior.

### Test 1: Daily Target

**Change:** `daily_target: 5`

**Expected:** Agent stops after 5 submissions, reports "Done: 5/5 submitted"

**Verify:** Check TRACKER.md has exactly 5 new ✅ entries

### Test 2: Search Keywords

**Change:** `search.keywords: ["Data Scientist"]`

**Expected:** All searched jobs are Data Scientist roles, not Software Engineer

**Verify:** TRACKER.md entries match the new keyword

### Test 3: Cover Letter Toggle

**Change:** `prepare.cover_letter_required: false`

**Expected:** No `cover_letter.md` generated in application folders

**Verify:** `ls applications/*/cover_letter.*` returns empty

### Test 4: Parallel Instances

**Change:** `submit.parallel_instances: 1`

**Expected:** Agent submits one at a time (sequential), not parallel

**Verify:** Check logs — only one Playwright instance used

### Test 5: Sponsorship Skip

**Change:** `automation.skip_on_no_sponsorship: false`

**Expected:** Agent applies to jobs even if JD says "no sponsorship"

**Verify:** Previously skipped jobs now get ⬜ status

### Test 6: Add Search Platform

**User says:** "Add Dice.com to search platforms"

**Expected:**
1. `config.json` updated: `search.platforms` includes `"dice"`
2. `references/search-guide.md` updated with Dice section
3. Next search includes Dice results

**Verify:** Both files updated, Dice jobs appear in TRACKER
