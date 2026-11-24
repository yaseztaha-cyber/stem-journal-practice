-- Match the About page body text to the S'28 cohort notation
UPDATE site_pages
SET body_md = REPLACE(body_md, 'G11 STEM Gharbiya', 'S''28 STEM Gharbiya'),
    updated_at = now()
WHERE slug = 'about';
