import { test, expect, readJson, isSortedAsc, isSortedDesc, type WebData } from '../../src/fixtures';

const { sortCases } = readJson<WebData>('web.json');

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('shows the product catalogue', { tag: ['@smoke', '@web'] }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
  });

  for (const row of sortCases) {
    test(`sort: ${row.title}`, { tag: ['@regression', '@web'] }, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(row.option);
      const values = row.by === 'name' ? await inventoryPage.productNames() : await inventoryPage.productPrices();
      const sorted = row.direction === 'asc' ? isSortedAsc<string | number>(values) : isSortedDesc<string | number>(values);
      expect(sorted, `${row.by} should be ${row.direction}: ${values.join(', ')}`).toBe(true);
    });
  }

  test('product details match the catalogue', { tag: ['@regression', '@web'] }, async ({ inventoryPage, productDetailsPage, webData }) => {
    const product = webData.products.single;
    await inventoryPage.openProduct(product.name);
    await productDetailsPage.expectOnPage();
    await expect(productDetailsPage.name).toHaveText(product.name);
    expect(await productDetailsPage.price()).toBe(product.price);
  });
});
