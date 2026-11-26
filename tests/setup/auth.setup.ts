import { test as setup, expect, readJson, type WebData } from '../../src/fixtures';
import { STORAGE_STATE } from '../../config/constants';

setup('authenticate standard user', async ({ loginPage, inventoryPage, page }) => {
  const { users } = readJson<WebData>('web.json');
  if (!process.env.WEB_PASSWORD) {
    throw new Error('WEB_PASSWORD is not set. Add it to .env (local) or repository secrets (CI).');
  }
  await loginPage.open();
  await loginPage.login(users.standard);
  await inventoryPage.expectOnPage();
  await expect(inventoryPage.header.title).toHaveText('Products');
  await page.context().storageState({ path: STORAGE_STATE });
});
