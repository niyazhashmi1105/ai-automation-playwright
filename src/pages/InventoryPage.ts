import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components';
import { ROUTES } from '../../config/constants';
import { parsePrice, step } from '../utils/helpers';
import type { SortOption } from '../types';

export class InventoryPage extends BasePage {
  protected readonly path = ROUTES.inventory;
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  protected get pageReadyLocator() {
    return this.page.getByTestId('inventory-list');
  }

  get items() {
    return this.page.getByTestId('inventory-item');
  }

  private item(name: string) {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) });
  }

  async addToCart(...names: string[]): Promise<void> {
    for (const name of names) {
      await step(`Add "${name}" to cart`, async () => {
        const card = this.item(name);
        await card.getByRole('button', { name: 'Add to cart' }).click();
        await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
      });
    }
  }

  async removeFromCart(name: string): Promise<void> {
    await step(`Remove "${name}" from cart`, async () => {
      const card = this.item(name);
      await card.getByRole('button', { name: 'Remove' }).click();
      await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    });
  }

  async sortBy(option: SortOption): Promise<void> {
    await step(`Sort products by "${option}"`, async () => {
      await this.page.getByTestId('product-sort-container').selectOption(option);
    });
  }

  async productNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allInnerTexts();
  }

  async productPrices(): Promise<number[]> {
    const texts = await this.page.getByTestId('inventory-item-price').allInnerTexts();
    return texts.map(parsePrice);
  }

  async priceOf(name: string): Promise<number> {
    return parsePrice(await this.item(name).getByTestId('inventory-item-price').innerText());
  }

  async openProduct(name: string): Promise<void> {
    await step(`Open product "${name}"`, () => this.item(name).getByTestId('inventory-item-name').click());
  }
}
