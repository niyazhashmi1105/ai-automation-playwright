import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components';
import { ROUTES } from '../../config/constants';
import { step } from '../utils/helpers';

export class CheckoutCompletePage extends BasePage {
  protected readonly path = ROUTES.checkoutComplete;
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  protected get pageReadyLocator() {
    return this.page.getByTestId('checkout-complete-container');
  }

  async expectOrderConfirmed(): Promise<void> {
    await step('Order confirmation shown', () =>
      expect(this.page.getByTestId('complete-header')).toHaveText('Thank you for your order!'),
    );
  }

  async backHome(): Promise<void> {
    await step('Back to products', () => this.page.getByTestId('back-to-products').click());
  }
}
