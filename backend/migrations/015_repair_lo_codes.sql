-- Repair LO codes mangled by 014 (middle part must NOT be padded: CH.2.01, not CH.02.01).
-- Canonical form: SUBJECT.major(unstripped).minor(padded to 2).
UPDATE questions SET learning_objectives = (
  SELECT COALESCE(array_agg(
    CASE WHEN v ~ '^[A-Z]{2,4}\.[0-9]{1,2}\.[0-9]{1,2}$'
    THEN split_part(v, '.', 1) || '.'
      || REGEXP_REPLACE(split_part(v, '.', 2), '^0+([0-9])', '\1') || '.'
      || LPAD(REGEXP_REPLACE(split_part(v, '.', 3), '^0+([0-9])', '\1'), 2, '0')
    ELSE v END ORDER BY o), '{}')
  FROM UNNEST(learning_objectives) WITH ORDINALITY AS u(v, o)
) WHERE learning_objectives <> '{}';
