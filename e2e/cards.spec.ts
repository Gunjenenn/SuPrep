import { expect, type Page, test } from '@playwright/test';

const DECK = '/cards/geo';

async function swipe(page: Page, dx: number) {
  const card = page.getByTestId('study-card');
  await expect(card).toBeVisible();
  const box = await card.boundingBox();
  if (!box) throw new Error('study card has no box');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 3;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y, { steps: 12 });
  await page.mouse.up();
}

const isGrade =
  (knew: boolean) =>
  (req: { method(): string; headers(): Record<string, string>; postData(): string | null }) =>
    req.method() === 'POST' &&
    'next-action' in req.headers() &&
    (req.postData() ?? '').includes(String(knew));

test.describe('swipe study session', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DECK);
    await expect(page.getByTestId('study-card')).toBeVisible();
  });

  test('dragging 200px right grades the card as known', async ({ page }) => {
    const graded = page.waitForRequest(isGrade(true));
    await swipe(page, 200);
    await graded;
    await expect(page.getByTestId('count-know')).toHaveText('1');
    await expect(page.getByTestId('count-again')).toHaveText('0');
  });

  test('dragging 200px left marks the card for again', async ({ page }) => {
    const graded = page.waitForRequest(isGrade(false));
    await swipe(page, -200);
    await graded;
    await expect(page.getByTestId('count-again')).toHaveText('1');
  });

  test('a short drag under 110px snaps back without grading', async ({ page }) => {
    const before = await page.getByTestId('study-card').getAttribute('aria-label');
    await swipe(page, 60);
    await expect(page.getByTestId('count-know')).toHaveText('0');
    await expect(page.getByTestId('study-card')).toHaveAttribute('aria-label', before ?? '');
  });

  test('tap flips the card and arrow keys grade it', async ({ page }) => {
    const card = page.getByTestId('study-card');
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('count-know')).toHaveText('1');
  });
});
