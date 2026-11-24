-- Backfill LO tags on official transfer questions (§: every transfer question
-- carries the LO it tests). Each mapping below is EITHER named explicitly in
-- the question text OR verified against the LO statement in the project
-- curriculum PDFs (see lotext logs). Rows with no verifiable LO (generic
-- "pick a subject", rubric-meta, English with no EN doc, unmapped topics)
-- stay untagged on purpose: a wrong tag is worse than none.

-- G10: codes named explicitly in the question text.
UPDATE questions SET learning_objectives = ARRAY['MA.1.01'], updated_at = now()
WHERE id = '04eddd8d-a5f4-4251-a816-fe01aae86e4c'; -- "In Math (Ma.1.01)... trig ratios"
UPDATE questions SET learning_objectives = ARRAY['CH.1.01'], updated_at = now()
WHERE id = 'c89e1ff1-9bf4-49ee-8f28-846456d2d05e'; -- "In (Ch 1.01)... theories and laws"
UPDATE questions SET learning_objectives = ARRAY['CH.1.10'], updated_at = now()
WHERE id = '49551a9e-8418-4d79-91ea-804a6803cc34'; -- "(Ch.1.10) Chemistry laboratory techniques"
UPDATE questions SET learning_objectives = ARRAY['PH.1.08'], updated_at = now()
WHERE id = '67550bee-9417-4817-8f10-6857604ddf91'; -- "In Physics (1.08)... pressure differences in fluids"

-- G10: verified LO statements (Chemistry.pdf / Physics.pdf in project path).
UPDATE questions SET learning_objectives = ARRAY['CH.1.01'], updated_at = now()
WHERE id = 'dce5890b-54bb-4a2a-b63a-ab073952e4a7'; -- scientific method + SI observation
UPDATE questions SET learning_objectives = ARRAY['PH.1.02'], updated_at = now()
WHERE id = '870fff12-25a4-4737-b22f-75241660348b'; -- Newton's 3rd Law interaction pairs

-- G11: explicit codes.
UPDATE questions SET learning_objectives = ARRAY['BI.2.01'], updated_at = now()
WHERE id = '32912b8e-cade-4822-8647-00ded7a61389'; -- "(Bi.2.01)... genetically modified bacteria"
UPDATE questions SET learning_objectives = ARRAY['MA.2.01'], updated_at = now()
WHERE id = 'f461c15f-b46f-4ae0-9406-7cbd64464b4e'; -- "modeling function you studied in Math 2.01"

-- G11: electrostatics domain (PH.2.02 verified: electrostatic forces via Coulomb's Law).
UPDATE questions SET learning_objectives = ARRAY['PH.2.02'], updated_at = now()
WHERE id = 'ce8c8adf-d2ee-4ad5-b831-6b08bce7038b'; -- Coulomb's Law, electric fields, electric potential
UPDATE questions SET learning_objectives = ARRAY['PH.2.02'], updated_at = now()
WHERE id = 'bf17ed23-30c6-4fa1-8437-1426be2960e6'; -- capacitor property = charge storage in electric field

-- G11: solutions domain (CH.2.02 verified: dissolved substances in water).
UPDATE questions SET learning_objectives = ARRAY['CH.2.02'], updated_at = now()
WHERE id = 'f206392b-8fdd-40a8-bd91-49814140cf10'; -- ranking salt concentration across solution samples

-- G12: measurement uncertainty (CH.3.02 verified).
UPDATE questions SET learning_objectives = ARRAY['CH.3.02'], updated_at = now()
WHERE id IN ('d82c0b1e-6287-4a00-9a4f-c7212d6db6b3', 'e0c83a37-1fa3-461f-96a9-f2a6e0a476c4');

-- G12: nervous system structure/function in communication (BI.3.01 verified).
UPDATE questions SET learning_objectives = ARRAY['BI.3.01'], updated_at = now()
WHERE id IN ('1b001a07-5f86-4877-a500-7545a62aa750', 'a4c59128-bfdf-4561-bdda-8ee7496fd3cc', 'f86cff4e-dbbb-410f-a7ea-b15deae50243');

-- G12: nervous components incl. reflex arc (BI.3.04 verified: sensory receptors are nervous components).
UPDATE questions SET learning_objectives = ARRAY['BI.3.04'], updated_at = now()
WHERE id = '6a115e60-2f5a-4b93-b059-c0a98c2feb68';

-- G12: geometrical optics, reflection/refraction (PH.3.01 verified).
UPDATE questions SET learning_objectives = ARRAY['PH.3.01'], updated_at = now()
WHERE id IN (
  '9ede1303-b15e-4fae-bb61-a23c21be76da', -- reflection/refraction and climate
  'ec3ebfaf-2e61-435d-996a-a99cf8210150', -- optics in communication capstone
  'cc39a98f-a602-494f-98ed-e341364f63d0', -- Snell's law, total internal reflection
  '3e5db31f-27a4-43e8-a668-10ac9dcc8bfe' -- light used for communicating information
);

-- G12: differentiation applied (MA.3.01 verified: implicit differentiation, real-world problems).
UPDATE questions SET learning_objectives = ARRAY['MA.3.01'], updated_at = now()
WHERE id = '28148adc-19a0-47e4-b168-a0e9667bd856';

-- G12: GPS evidence for plate motions (ES.3.02 verified).
UPDATE questions SET learning_objectives = ARRAY['ES.3.02'], updated_at = now()
WHERE id = 'af5149dd-2f97-47d6-b6d2-4a6b1ba2ffcf';

-- G12: nervous system + volcanism/seismicity patterns.
UPDATE questions SET learning_objectives = ARRAY['BI.3.01', 'ES.3.01'], updated_at = now()
WHERE id = '3d533c5d-3da6-4fcf-a5c5-a1d33a95ded1'; -- BI.3.01 verified; ES.3.01 verified (tectonics/volcanism/seismicity)

-- G12: scientific reports, law vs theory (CH.3.01 verified).
UPDATE questions SET learning_objectives = ARRAY['CH.3.01'], updated_at = now()
WHERE id = '4c34ac99-a229-4a64-9a62-615974f617f7';

-- G12: experimental design and investigation (CH.3.03 verified: design/conduct investigation).
UPDATE questions SET learning_objectives = ARRAY['CH.3.03'], updated_at = now()
WHERE id IN ('470f698f-ef7f-4258-b9e8-c5d0fbeb4964', '4d35dc8f-3548-4e5c-a1e9-2356c7181482');

-- Shared-pool water theme: topics matching verified statements.
UPDATE questions SET learning_objectives = ARRAY['CH.2.02'], updated_at = now()
WHERE id = '413f4854-6752-428a-9721-5c25639e330d'; -- dissolved/suspended materials in water
UPDATE questions SET learning_objectives = ARRAY['ME.2.01'], updated_at = now()
WHERE id = 'ffd88116-fff9-4de9-af66-4401dceff741'; -- kinetic vs static friction
UPDATE questions SET learning_objectives = ARRAY['ES.2.03'], updated_at = now()
WHERE id = 'd713250f-887c-40ea-b687-afc0fecc0d28'; -- human/natural factors controlling water resources
UPDATE questions SET learning_objectives = ARRAY['MA.2.03'], updated_at = now()
WHERE id = '3eb5c13e-c6d4-4001-83b7-9687c624b95f'; -- counting principle, permutations, combinations
