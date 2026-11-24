DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'question_source' AND e.enumlabel = 'official') THEN
    ALTER TYPE question_source ADD VALUE 'official';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'question_source' AND e.enumlabel = 'official_adapted') THEN
    ALTER TYPE question_source ADD VALUE 'official_adapted';
  END IF;
END $$;
