# RELEASE AUDIT — 02 EDP QUESTION AUDIT

## Scope
Audit all Engineering Design Process (EDP) questions across question banks for:
1. Correct categorization as `engineering_design_process`
2. Proper mapping to EDP stages (platform + challenge-specific)
3. Separation from non-EDP question types in UI
4. Question integrity (no water-theme contamination)

## Question Inventory

### officialJournals.ts (official questions)
| # | Category | Question Type | Source | EDP Stage Mapping |
|---|---|---|---|---|
| 1 | engineering_design_process | "Write your Project Conclusion..." | Official G10 Sample — J5 | Stage 11 (Evaluation) / Stage 12 (Reflection) |

Total official EDP questions: **1**

### practicePackG11S1.ts (practice questions, G11 S1 packaging challenge)
| Range | Category | Question Type | Count | Theme |
|---|---|---|---|---|
| lines 314-594 | engineering_design_process | ENGINEERING_DESIGN_PROCESS | 20 | Food packaging preservation |

EDP question topics:
1. Product choice + deterioration mechanism (requirements)
2. Material selection with rejected alternatives (generating/selecting)
3. Prototype iteration forced by test result (testing → iteration)
4. PVI pigment choice + calibration (testing)
5. Control fairness + consistency weakness (testing)
6. Package volume sizing 1.0–3.0 L (planning/requirements)
7. Closure/sealing mechanism (building)
8. Deterioration driver + material layers (researching/requirements)
9. Two measurable indicators at 0–120 h (testing/planning)
10. "End of acceptable preservation" endpoint (planning/testing)
11. Safety constraint shaping design (constraints)
12. Device calibration (testing)
13. Prototype vs control comparison with data (analyzing)
14. Biggest failure + reusable rule (iteration/reflection)
15. Documentation for rebuild (documentation)
16. Natural vs conventional materials (sustainability)
17. Three-condition reference scale (testing/calibration)
18. Strongest claim limited to measured variables (evaluation)
19. EDP step time audit + defense (reflection/process)
20. Transfer to different food + re-test (transfer)

Total practice EDP questions: **20**

### EDP Stage Library (platform_edp_stages, migration 019)
| Stage No | Title | Sort |
|---|---|---|
| 1 | Understanding the Problem | 1 |
| 2 | Researching the Problem | 2 |
| 3 | Identifying Requirements | 3 |
| 4 | Generating Ideas | 4 |
| 5 | Selecting a Solution | 5 |
| 6 | Planning the Prototype | 6 |
| 7 | Building | 7 |
| 8 | Testing | 8 |
| 9 | Analyzing Results | 9 |
| 10 | Iteration | 10 |
| 11 | Evaluation | 11 |
| 12 | Reflection | 12 |

Total platform EDP stages: **12**

## Defects Found

| ID | Severity | Location | Problem | Fix |
|---|---|---|---|---|
| EDP-01 | MEDIUM | `practicePackG11S1.ts` | EDP questions reference `scope.question_type: 'ENGINEERING_DESIGN_PROCESS'` but no explicit `edp_stage_no` field links each question to a specific EDP stage | Add `edp_stage_no` to PackQ scope or note in tags |
| EDP-02 | LOW | `officialJournals.ts` | Only 1 official EDP question; G10 Sample J5 conclusion question maps to Evaluation/Reflection but has no explicit stage tag | Add EDP stage tag or note |
| EDP-03 | LOW | `backend/src/routes/edp.ts` | `/edp/stages` returns stages but frontend doesn't expose a stage picker on the Practice page for EDP-tagged questions | Wire stage picker to EDP questions in Practice UI |
| EDP-04 | LOW | `frontend/src/pages/Challenge.tsx` | Challenge page shows track stages but doesn't link them to specific EDP practice questions | Add cross-reference between track stages and EDP question bank |

## Water Contamination Check
- No water-theme EDP questions found in practicePackG11S1.ts
- EDP questions reference "water" only as a keyword in test descriptions (e.g., seal test uses "water") — this is legitimate, not water-theme contamination
- Water-theme questions (40) were previously removed from officialJournals.ts

## Recommendation
1. Add `edp_stage_no` field to practice EDP questions for stage-graded mocks
2. Add EDP stage tags to official EDP question
3. Wire stage picker to Practice page for EDP-tagged questions (Phase 6 UI work)
