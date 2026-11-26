import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components';
import { ROUTES } from '../../config/constants';
import { parsePrice, step } from '../utils/helpers';

export class CartPage extends BasePage {
  protected readonly path = ROUTES.cart;
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  protected get pageReadyLocator() {
    return this.page.getByTestId('cart-list');
  }

  get items() {
    return this.page.getByTestId('inventory-item');
  }

  async itemNames(): Promise<string[]> {
    return this.items.getByTestId('inventory-item-name').allInnerTexts();
  }

  async itemPrices(): Promise<number[]> {
    return (await this.items.getByTestId('inventory-item-price').allInnerTexts()).map(parsePrice);
  }

  async remove(name: string): Promise<void> {
    await step(`Remove "${name}" from cart page`, async () => {
      await this.items.filter({ hasText: name }).getByRole('button', { name: 'Remove' }).click();
    });
  }

  async checkout(): Promise<void> {
    await step('Proceed to checkout', () => this.page.getByTestId('checkout').click());
  }

  async continueShopping(): Promise<void> {
    await step('Continue shopping', () => this.page.getByTestId('continue-shopping').click());
  }
}
