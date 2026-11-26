import { test, expect } from '../../src/fixtures';

/**
 * Seed for Playwright Test Agents (planner / generator / healer).
 * Starts authenticated (storageState from the setup project) on the landing page.
 * Agents copy this context; keep it minimal.
 */
test.describe('Seed', () => {
  test('seed: authenticated on inventory', { tag: ['@web'] }, async ({ inventoryPage }) => {
    await inventoryPage.open();
    await expect(inventoryPage.header.title).toHaveText('Products');
  });
});
