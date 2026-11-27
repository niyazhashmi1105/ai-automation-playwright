import { test, expect } from '../../src/fixtures';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('add items updates badge and cart', { tag: ['@smoke', '@web'] }, async ({ inventoryPage, cartPage, webData }) => {
    const names = webData.products.journey.map((p) => p.name);
    await inventoryPage.addToCart(...names);
    await inventoryPage.header.expectCartCount(names.length);

    await inventoryPage.header.openCart();
    await cartPage.expectOnPage();
    expect(await cartPage.itemNames()).toEqual(names);
  });

  test('remove item from inventory and cart', { tag: ['@regression', '@web'] }, async ({ inventoryPage, cartPage, webData }) => {
    const [first, second] = webData.products.journey;
    await inventoryPage.addToCart(first.name, second.name);
    await inventoryPage.removeFromCart(first.name);
    await inventoryPage.header.expectCartCount(1);

    await inventoryPage.header.openCart();
    await cartPage.remove(second.name);
    await expect(cartPage.items).toHaveCount(0);
    await cartPage.header.expectCartCount(0);
  });

  test('continue shopping keeps the cart', { tag: ['@regression', '@web'] }, async ({ inventoryPage, cartPage, webData }) => {
    const { name } = webData.products.single;
    await inventoryPage.addToCart(name);
    await inventoryPage.header.openCart();
    await cartPage.expectOnPage();

    await cartPage.continueShopping();
    await inventoryPage.expectOnPage();
    await inventoryPage.header.expectCartCount(1);

    await inventoryPage.header.openCart();
    await cartPage.expectOnPage();
    expect(await cartPage.itemNames()).toEqual([name]);
  });

  test('add from product details', { tag: ['@regression', '@web'] }, async ({ inventoryPage, productDetailsPage, webData }) => {
    await inventoryPage.openProduct(webData.products.single.name);
    await productDetailsPage.expectOnPage();
    await productDetailsPage.addToCart();
    await productDetailsPage.header.expectCartCount(1);
  });
});
