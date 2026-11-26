import { test, expect, validateSchema, userSchema } from '../../src/fixtures';

/**
 * Hybrid: API provides/validates data, UI consumes it.
 * The demo app has no backend API of its own, so the API user's profile
 * drives the checkout form — showing how API setup feeds a UI flow.
 */
test.describe('Hybrid API + UI', () => {
  test(
    'API user profile drives checkout form',
    { tag: ['@regression', '@e2e', '@web', '@api'] },
    async ({ usersApi, apiData, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, webData }) => {
      const res = await usersApi.getById(apiData.existingUserId);
      expect(res.status).toBe(200);
      expect(validateSchema(res.body, userSchema).errors).toEqual([]);

      const [firstName, ...rest] = res.body.name.split(' ');
      const info = { firstName, lastName: rest.join(' ') || 'Unknown', postalCode: res.body.address.zipcode };

      await inventoryPage.open();
      await inventoryPage.addToCart(webData.products.single.name);
      await inventoryPage.header.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.submit(info);
      await checkoutOverviewPage.expectOnPage();
      expect(await checkoutOverviewPage.itemNames()).toEqual([webData.products.single.name]);
    },
  );
});
