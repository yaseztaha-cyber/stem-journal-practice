-- Custom STEM dictionary for the offline writing checker (§: Word-style check).
-- Words here are never flagged as misspelled. Admin-managed; students also
-- keep personal lists locally in their browser.
CREATE TABLE IF NOT EXISTS custom_words (
  word TEXT PRIMARY KEY CHECK (word = LOWER(word) AND word ~ '^[a-z][a-z''-]{1,59}$'),
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO custom_words(word) VALUES
  ('chitosan'), ('beeswax'), ('anthocyanin'), ('anthocyanins'), ('turmeric'), ('beetroot'),
  ('kraft'), ('repurposed'), ('upcycled'), ('upcycle'), ('biopolymer'), ('bioplastic'),
  ('desiccant'), ('agar'), ('petri'), ('coli'), ('coliform'), ('inoculate'), ('inoculated'),
  ('tds'), ('ph'), ('ppm'), ('rh'), ('cfu'),
  ('baladi'), ('ful'), ('taamiya'), ('koshari'), ('molokhia'), ('feteer'), ('duqqa'),
  ('gharbiya'), ('sharkya'), ('gharbia'), ('behira'), ('monufia'), ('qalyubia'),
  ('capstone'), ('stem'), ('edp'), ('pvi'),
  ('calorimeter'), ('spectrometer'), ('turbidity'), ('salinity'), ('filtrate'), ('permeate'),
  ('retentate'), ('adsorbent'), ('coagulant'), ('flocculant'), ('plasticizer'),
  ('polyurethane'), ('polymer'), ('monomer'), ('copolymer'), ('hydrogel'), ('aerogel'),
  ('mycorrhiza'), ('rhizobia'), ('phytohormone'), ('germination'), ('transpiration'),
  ('electroplating'), ('anodizing'), ('galvanizing'), ('thermocouple'), ('manometer'),
  ('viscometer'), ('refractometer'), ('colorimeter'), ('photometer'),
  ('wavelength'), ('nanoparticle'), ('microplastic'), ('eutrophication'), ('desalination'),
  ('electrodialysis'), ('ultrafiltration'), ('greywater'), ('leachate'), ('compostable'),
  ('biodegrade'), ('biodegrades'), ('feedstock'), ('valorization')
ON CONFLICT (word) DO NOTHING;
