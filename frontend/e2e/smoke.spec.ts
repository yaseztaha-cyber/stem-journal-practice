import { test, expect } from '@playwright/test';

function uniq(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
}

test('register → semester workspace → journal loop entry points', async ({ page }) => {
  const email = uniq('e2e');
  await page.goto('/register');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).first().fill('Password123!');
  await page.getByLabel(/display name/i).fill('E2E Student');
  await page.getByRole('button', { name: /create account|register|get started/i }).click();
  await expect(page).toHaveURL(/dashboard|semester/, { timeout: 15000 });

  // Context badge visible everywhere
  await expect(page.locator('.ctx-badge').first()).toContainText(/G\d+ • S\d/);

  // Semester workspace
  await page.goto('/semester');
  await expect(page.getByRole('heading', { name: /G\d+ S\d/ }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Smart Sustainable Food Packaging/ }).first()).toBeVisible();

  // EDP challenge detail
  await page.goto('/challenge');
  await expect(page.getByText(/Smart Sustainable Food Packaging|not yet imported/)).toBeVisible();

  // Practice with journal grouping
  await page.goto('/practice');
  await expect(page.getByText(/Choose what to train/)).toBeVisible();

  // Transfer LO bar appears on the transfer tab; picking a chip filters
  await page.getByRole('button', { name: /transfer/i }).first().click();
  await expect(page.locator('.lo-rail').first()).toBeVisible({ timeout: 15000 });
  const chips = page.locator('.lo-chip');
  const nChips = await chips.count();
  expect(nChips).toBeGreaterThan(3);
  await chips.first().click();
  await expect(page.locator('.lo-count').first()).toContainText(/1 of/);

  // Mock start offers LO choice
  await page.goto('/mock');
  await expect(page.getByRole('button', { name: /start mock journal/i })).toBeVisible();

  // About + creator + contact
  await page.goto('/about');
  await expect(page.getByText(/Yassen Taha Hussainy Elnasher/).first()).toBeVisible();
  await expect(page.getByText(/stemgharbiya\.moe\.edu\.eg/).first()).toBeVisible();

  // Academy units render with track badges
  await page.goto('/academy');
  await expect(page.getByText(/Research Questions and Problem Statements/).first()).toBeVisible({ timeout: 15000 });
});

test('mock journal locks question 1 and lets the student go back to revise it', async ({ page }) => {
  test.setTimeout(240000);
  const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
  await page.goto('/register');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).first().fill('Password123!');
  await page.getByLabel(/display name/i).fill('E2E Mock Student');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).toHaveURL(/dashboard|semester/, { timeout: 15000 });

  await page.goto('/mock');
  // The EDP stage picker is offered for the teamwork question.
  const stageSelect = page.locator('#mock-stage');
  await expect(stageSelect).toBeVisible();
  await stageSelect.selectOption({ index: 1 });

  await page.getByRole('button', { name: /start mock journal/i }).click();
  await expect(page).toHaveURL(/\/mock\//, { timeout: 20000 });
  await expect(page.locator('.step-dot')).toHaveCount(4);

  // Later questions are locked until question 1 is answered.
  await expect(page.locator('.step-dot').nth(1)).toBeDisabled();
  await expect(page.locator('.step-dot').nth(3)).toBeDisabled();

  // Answering Q1 unlocks the rest.
  await page.locator('#mock-answer').fill(
    'During week four our prototype test failed because the closure did not hold, so I took responsibility for rebuilding the seal with my team. We measured the internal pressure at zero, twenty-four and forty-eight hours, and because the second reading dropped we changed the material and retested until it held.',
  );
  await page.getByRole('button', { name: /save & next question/i }).click();
  await expect(page.locator('.step-dot').nth(1)).toBeEnabled({ timeout: 20000 });

  // Go back to Q1 to revise it.
  await page.locator('.step-dot').nth(0).click();
  await expect(page.locator('#mock-answer')).toHaveValue(/prototype test failed/);
  await expect(page.getByText(/answered \(you can revise it\)/i)).toBeVisible();
});

test('upload journal answers and grade them', async ({ page }) => {
  test.setTimeout(240000);
  const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
  await page.goto('/register');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).first().fill('Password123!');
  await page.getByLabel(/display name/i).fill('E2E Uploader');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).toHaveURL(/dashboard|semester/, { timeout: 15000 });

  await page.goto('/analyze');
  await page.getByLabel(/which journal question/i).selectOption({ index: 1 });
  const journal = 'Our team built a water filter prototype. We tested it for five days with daily readings of clarity and flow rate in the school laboratory because we needed reliable data. The first seal leaked badly so we doubled the gasket thickness and repeated all measurements until results were stable and trustworthy for our final conclusion.';
  await page.locator('input[type="file"]').setInputFiles({ name: 'journal.txt', mimeType: 'text/plain', buffer: Buffer.from(journal) });
  await page.getByRole('button', { name: /analyze journal/i }).click();
  await expect(page.getByText(/Grade this as my answer/).first()).toBeVisible({ timeout: 90000 });
  await page.getByText(/Grade this as my answer/).first().click();
  await expect(page).toHaveURL(/\/attempt\//, { timeout: 90000 });
  await expect(page.getByText(/BLUE|GREEN|YELLOW|RED/).first()).toBeVisible({ timeout: 30000 });
});

test('writing checker flags misspellings with fixes', async ({ page }) => {
  const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
  await page.goto('/register');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).first().fill('Password123!');
  await page.getByLabel(/display name/i).fill('E2E Writer');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).toHaveURL(/dashboard|semester/, { timeout: 15000 });

  await page.goto('/practice');
  await page.getByRole('button', { name: /give me a question/i }).click();
  await expect(page.locator('#answer')).toBeVisible({ timeout: 15000 });
  await page.locator('#answer').fill('The prototype was succesful but teh measurments show it faild.  This is good.');
  await page.getByRole('button', { name: /check spelling & grammar/i }).click();
  await expect(page.getByText(/Did you mean/).first()).toBeVisible({ timeout: 20000 });
  // Apply the first suggested fix and confirm the text changed.
  await page.getByRole('button', { name: /→ successful/i }).first().click();
  await expect(page.locator('#answer')).toHaveValue(/successful/);
});
