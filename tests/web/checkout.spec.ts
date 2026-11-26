import { test, expect, readJson, sum, roundMoney, type WebData } from '../../src/fixtures';

const { checkoutValidation } = readJson<WebData>('web.json');

test.describe('Checkout', () => {
  test(
    'full purchase journey with calculated totals',
    { tag: ['@smoke', '@e2e', '@web'] },
    async ({ inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage, webData }) => {
      const products = webData.products.journey;
      const names = products.map((p) => p.name);

      await inventoryPage.open();
      // Catalogue prices must match the test data before we trust the totals.
      for (const p of products) expect(await inventoryPage.priceOf(p.name)).toBe(p.price);

      await inventoryPage.addToCart(...names);
      await inventoryPage.header.openCart();
      await cartPage.expectOnPage();
      expect(await cartPage.itemNames()).toEqual(names);

      await cartPage.checkout();
      await checkoutInfoPage.expectOnPage();
      await checkoutInfoPage.submit(webData.checkout);

      await checkoutOverviewPage.expectOnPage();
      expect(await checkoutOverviewPage.itemNames()).toEqual(names);

      const expectedItemTotal = sum(products.map((p) => p.price));
      const expectedTax = roundMoney(expectedItemTotal * webData.taxRate);
      const summary = await checkoutOverviewPage.summary();
      expect(summary.itemTotal).toBe(sum(await checkoutOverviewPage.itemPrices()));
      expect(summary.itemTotal).toBe(expectedItemTotal);
      expect(summary.tax).toBe(expectedTax);
      expect(summary.total).toBe(roundMoney(expectedItemTotal + expectedTax));

      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectOnPage();
      await checkoutCompletePage.expectOrderConfirmed();
      await checkoutCompletePage.header.expectCartCount(0);
    },
  );

  test.describe('information form validation', () => {
    test.beforeEach(async ({ inventoryPage, cartPage, checkoutInfoPage, webData }) => {
      await inventoryPage.open();
      await inventoryPage.addToCart(webData.products.single.name);
      await inventoryPage.header.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.expectOnPage();
    });

    for (const row of checkoutValidation) {
      test(`checkout validation: ${row.title}`, { tag: ['@regression', '@web'] }, async ({ checkoutInfoPage }) => {
        await checkoutInfoPage.submit(row);
        await checkoutInfoPage.error.expectMessage(row.expectedError);
        await checkoutInfoPage.expectOnPage();
      });
    }
  });
});
