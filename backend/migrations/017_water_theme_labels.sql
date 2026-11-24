-- Water-theme items are practice material: label them honestly.
UPDATE questions
SET source_label = REPLACE(source_label, 'Official Water Theme', 'Practice · Water Theme'),
    updated_at = now()
WHERE source_label LIKE 'Official Water Theme%';
