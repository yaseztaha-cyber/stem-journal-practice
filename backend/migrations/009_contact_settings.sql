-- Creator contact info for footer + About page
INSERT INTO site_settings(key, value) VALUES
  ('contact_email', 'yaseen.1925048@stemgharbiya.moe.edu.eg'),
  ('contact_whatsapp', '+201092332523')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
