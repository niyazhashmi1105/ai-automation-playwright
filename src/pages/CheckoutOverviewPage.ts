import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components';
import { ROUTES } from '../../config/constants';
import { parsePrice, step } from '../utils/helpers';

export interface OrderSummary {
  itemTotal: number;
  tax: number;
  total: number;
}

export class CheckoutOverviewPage extends BasePage {
  protected readonly path = ROUTES.checkoutOverview;
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  protected get pageReadyLocator() {
    return this.page.getByTestId('checkout-summary-container');
  }

  async itemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allInnerTexts();
  }

  async itemPrices(): Promise<number[]> {
    return (await this.page.getByTestId('inventory-item-price').allInnerTexts()).map(parsePrice);
  }

  async summary(): Promise<OrderSummary> {
    return step('Read order summary', async () => ({
      itemTotal: parsePrice(await this.page.getByTestId('subtotal-label').innerText()),
      tax: parsePrice(await this.page.getByTestId('tax-label').innerText()),
      total: parsePrice(await this.page.getByTestId('total-label').innerText()),
    }));
  }

  async finish(): Promise<void> {
    await step('Finish order', () => this.page.getByTestId('finish').click());
  }
}
