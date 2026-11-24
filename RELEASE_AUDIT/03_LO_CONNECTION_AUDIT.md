# RELEASE AUDIT — 03 LO CONNECTION AUDIT

## Scope
Audit Learning Objective (LO) connections across:
1. LO transfer questions in practice packs (coverage matrix)
2. LO codes on official questions (migration 018)
3. LO Connections page existence (frontend)
4. LO filtering capability in Practice UI

## LO Transfer Question Coverage (practicePackG11S1.ts)

### 15 LOs × 4 questions each = 60 questions

| LO Code | Subject | Q Count | Question Types (by difficulty) |
|---|---|---|---|
| CH.2.01 | Chemistry | 4 | ionic salts, hard water, pH indicator, salt preservation claim |
| CH.2.04 | Chemistry | 4 | oxidation, light exposure, antioxidant coating, time-shift interpretation |
| PH.2.01 | Physics | 4 | measurement precision, static forces, insulation/mass, sealing demo |
| PH.2.02 | Physics | 4 | light deterioration, non-destructive observation, window prediction, PVI placement |
| BI.2.01 | Biology | 4 | microorganisms, mold interpretation, safety rule, antimicrobial proposal |
| BI.2.02 | Biology | 4 | enzymes, surface area, plant pigment, quality vs safety |
| BI.2.05 | Biology | 4 | nutrient cycles, life cycle after exhibition, equilibrium, scale estimation |
| MA.2.01 | Math | 4 | function modeling, calibration curve, volume inequalities, shape optimization |
| MA.2.02 | Math | 4 | descriptive statistics, variation uncertainty, missing data honesty, graph design |
| MA.2.03 | Math | 4 | production rate estimation, material cost comparison, thickness trade-off, ratio literacy |
| ES.2.01 | Earth Science | 4 | material sourcing, temperature swings, climate transfer, water footprint |
| ES.2.04 | Earth Science | 4 | landfill vs compost, waste diversion claim, agricultural residues, soil/water/air interactions |
| CS.2.01 | CS | 4 | data organization, procedural algorithm, camera objectivity, backup/versioning |
| CS.2.02 | CS | 4 | decision rule logic, logical debugging, reversible/irreversible, outlier integrity |
| ENL.2.01 | English | 4 | precision editing, descriptive vs argumentative, poster design, passive voice |

Total LO transfer questions: **60**

Each question carries `scope.learning_objectives: ['XX.Y.ZZ']` — properly tagged.

## LO Codes on Official Questions (migration 018)

Migration `018_official_lo_tags.sql` backfills LO codes on official questions by UUID:

**G10 explicit codes:**
- MA.1.01 → trig ratios question
- CH.1.01 → theories and laws question
- CH.1.10 → chemistry lab techniques question
- PH.1.08 → pressure differences in fluids question

**G10 verified:**
- CH.1.01 → scientific method + SI observation
- PH.1.02 → Newton's 3rd Law interaction pairs

**G11 explicit:**
- BI.2.01 → genetically modified bacteria question
- MA.2.01 → modeling function question

**G11 verified:**
- PH.2.02 → Coulomb's Law questions (2)
- CH.2.02 → salt concentration ranking question

**G12 verified:**
- CH.3.02 → measurement uncertainty (2 questions)
- BI.3.01 → nervous system structure/function (3 questions)
- BI.3.04 → reflex arc / nervous components
- PH.3.01 → geometrical optics (4 questions)
- MA.3.01 → differentiation applied
- ES.3.02 → GPS evidence for plate motions
- BI.3.01 + ES.3.01 → nervous system + volcanism/seismicity
- CH.3.01 → scientific reports, law vs theory
- CH.3.03 → experimental design and investigation (2 questions)

**Shared-pool water theme:**
- CH.2.02 → dissolved/suspended materials in water
- ME.2.01 → kinetic vs static friction
- ES.2.03 → human/natural factors controlling water resources
- MA.2.03 → counting principle, permutations, combinations

Total LO-tagged official questions: **~20+**

## LO Connections Page — MISSING

No `/lo-connections` route exists in `frontend/src/App.tsx`. Required pages:
- LO Connections page: browse LOs by subject, see which questions test each LO, student progress per LO

## Defects Found

| ID | Severity | Location | Problem | Fix |
|---|---|---|---|---|
| LO-01 | HIGH | `frontend/src/App.tsx` | No LO Connections page route | Add `/lo-connections` route + page component |
| LO-02 | MEDIUM | `frontend/src/pages/Practice.tsx` | No LO filter in Practice UI for learning_transfer questions | Add LO filter dropdown |
| LO-03 | MEDIUM | `backend/src/routes/questions.ts` | No LO-based question filtering endpoint | Add `?lo=` filter to questions endpoint |
| LO-04 | LOW | `backend/migrations/018_official_lo_tags.sql` | References "Shared-pool water theme" questions whose IDs may no longer exist after water question removal | Verify referenced UUIDs still exist; if not, remove stale UPDATEs |

## Water Contamination Check
- LO transfer questions reference "water" only as a project variable (packaging water, wash water) — legitimate, not water-theme contamination
- Water-theme questions were removed from officialJournals.ts; practice pack water references are about packaging/water as a variable in the food preservation challenge

## Recommendation
1. Create LO Connections page (`/lo-connections`) with subject/LO browser
2. Add LO filter to Practice page for transfer questions
3. Add `?lo_code=` query param to questions API endpoint
4. Verify migration 018 UUIDs still reference existing questions
