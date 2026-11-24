# RELEASE AUDIT — 04 WATER QUESTION INTEGRITY

## Scope
Verify all water-theme questions were properly removed from officialJournals.ts and no water-theme contamination remains in official question banks.

## Removal History
- 40 water-related questions removed from `backend/src/data/officialJournals.ts` via node regex script
- Unrelated questions also removed: King Lear literary analysis, summer camp feedback, "time allocated for Capstone", "textbook for each subject"
- officialJournals.ts now contains 3 questions (all G10 Sample J5): team_collaboration, engineering_design_process, learning_transfer

## Water Reference Inventory (post-removal)

### officialJournals.ts
- Zero water references — CLEAN

### practicePackG11S1.ts (practice questions — NOT official)
Water references are legitimate project variables in the food preservation packaging challenge:
- Line 407: seal test keyword "water" (leak test medium)
- Line 599-617: CH.2.01 transfer questions about ionic salts in water, hard water damage
- Line 759: PH.2.01 sealing demo keyword "water"
- Line 1174, 1211-1215, 1268-1272: ES.2.01/ES.2.04 transfer questions about water footprint, soil/water/air interactions
- These are practice questions, not official — water is a legitimate variable in the packaging challenge context

### practicePackVolume2-4.ts (practice questions — NOT official)
- Volume 2 line 304: evaporation vs chemical change water distinction
- Volume 2 line 447-448: wastewater disposal reasoning
- Volume 2 line 538-539: water input/output lifecycle mapping
- Volume 2 line 1062-1067: water cycle mapping
- Volume 3 line 613-617: tap vs distilled water comparison
- Volume 3 line 704: water source ranking
- Volume 4 line 36-53: wash water dissolved substances
- Volume 4 line 360-368: tap water dissolved substances
- Volume 4 line 384-400: ES.2.03 water resources
- All are practice questions with `source: 'practice'` — water is a legitimate project variable

### academyContent*.ts (academy examples — NOT questions)
- Water filter examples in educational content (gravel pre-filtration, turbidity, canal water)
- These are academy learning examples, not journal questions

### subjectLibrary.ts (subject reference — NOT questions)
- General science reference questions including water topics
- Reference library, not journal questions

### peerGuidePack.ts (peer examples — NOT official questions)
- Water treatment / wastewater examples in peer guide
- Reference examples, not official journal questions

## Migration Checks

### 017_water_theme_labels.sql
```sql
UPDATE questions SET source_label = REPLACE(source_label, 'Official Water Theme', 'Practice · Water Theme')
WHERE source_label LIKE 'Official Water Theme%';
```
- This migration labels any remaining DB rows with "Official Water Theme" as practice — safety net
- No water-theme official questions remain in code

### 018_official_lo_tags.sql lines 81-88
References "Shared-pool water theme" questions with UUIDs:
- `413f4854-6752-428a-9721-5c25639e330d` (CH.2.02)
- `ffd88116-fff9-4de9-af66-4401dceff741` (ME.2.01)
- `d713250f-887c-40ea-b687-afc0fecc0d28` (ES.2.03)
- `3eb5c13e-c6d4-4001-83b7-9687c624b95f` (MA.2.03)
- These UUIDs may not exist in the questions table after water question removal — need DB verification

## Defects Found

| ID | Severity | Location | Problem | Fix |
|---|---|---|---|---|
| WATER-01 | LOW | `backend/migrations/018_official_lo_tags.sql` | Migration references water-theme question UUIDs that may no longer exist after removal | Verify UUIDs exist in DB; remove stale UPDATEs if not |
| WATER-02 | INFO | `backend/src/data/practicePack*.ts` | Water references in practice packs are legitimate (packaging challenge variables) — NOT water-theme contamination | No action needed |
| WATER-03 | INFO | `backend/src/data/academyContent*.ts` | Water filter examples in academy content are educational — NOT official questions | No action needed |

## Recommendation
1. Run migration 018 against a test DB to verify UUIDs exist; prune any that don't
2. Document that practice pack water references are legitimate project variables, not removed water-theme questions
