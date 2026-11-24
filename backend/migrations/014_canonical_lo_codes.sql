-- Canonical LO codes: zero-padded parts (ES.2.01, never ES.2.1)
UPDATE questions SET learning_objectives = (
  SELECT COALESCE(array_agg(
    CASE WHEN v ~ '^[A-Z]{2,4}\.[0-9]{1,2}\.[0-9]{1,2}$'
    THEN split_part(v, '.', 1) || '.' || LPAD(split_part(v, '.', 2), 2, '0') || '.' || LPAD(split_part(v, '.', 3), 2, '0')
    ELSE v END ORDER BY o), '{}')
  FROM UNNEST(learning_objectives) WITH ORDINALITY AS u(v, o)
) WHERE learning_objectives <> '{}';
