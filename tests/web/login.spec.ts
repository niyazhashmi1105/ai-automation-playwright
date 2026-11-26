import { test, expect, readJson, ROUTES, type WebData } from '../../src/fixtures';

const { invalidLogins } = readJson<WebData>('web.json');

test.describe('Login', () => {
  // Login tests must start logged out.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('valid user lands on products', { tag: ['@smoke', '@web'] }, async ({ loginPage, inventoryPage, webData }) => {
    await loginPage.open();
    await loginPage.login(webData.users.standard);
    await inventoryPage.expectOnPage();
    await expect(inventoryPage.header.title).toHaveText('Products');
  });

  for (const row of invalidLogins) {
    test(`invalid login: ${row.title}`, { tag: ['@regression', '@web'] }, async ({ loginPage }) => {
      await loginPage.open();
      await loginPage.login({ username: row.username, password: row.password });
      await loginPage.error.expectMessage(row.expectedError);
      await loginPage.expectOnPage();
    });
  }

  test('error banner can be dismissed', { tag: ['@regression', '@web'] }, async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login({ username: '', password: '' });
    await loginPage.error.expectMessage('Username is required');
    await loginPage.error.dismiss();
  });

  test('logout returns to login and protects pages', { tag: ['@smoke', '@web'] }, async ({ loginPage, inventoryPage, webData, page }) => {
    await loginPage.open();
    await loginPage.login(webData.users.standard);
    await inventoryPage.expectOnPage();

    await inventoryPage.header.menu.logout();
    await loginPage.expectOnPage();

    await page.goto(ROUTES.inventory);
    await loginPage.error.expectMessage("You can only access '/inventory.html' when you are logged in.");
  });
});
