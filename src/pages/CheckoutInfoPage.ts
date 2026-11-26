import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ErrorBanner, Header } from '../components';
import { ROUTES } from '../../config/constants';
import { step } from '../utils/helpers';
import type { CheckoutInfo } from '../types';

export class CheckoutInfoPage extends BasePage {
  protected readonly path = ROUTES.checkoutInfo;
  readonly header: Header;
  readonly error: ErrorBanner;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.error = new ErrorBanner(page);
  }

  protected get pageReadyLocator() {
    return this.page.getByTestId('checkout-info-container');
  }

  async fill(info: CheckoutInfo): Promise<void> {
    await step('Fill checkout information', async () => {
      await this.page.getByTestId('firstName').fill(info.firstName);
      await this.page.getByTestId('lastName').fill(info.lastName);
      await this.page.getByTestId('postalCode').fill(info.postalCode);
    });
  }

  async continue(): Promise<void> {
    await step('Continue to overview', () => this.page.getByTestId('continue').click());
  }

  async submit(info: CheckoutInfo): Promise<void> {
    await this.fill(info);
    await this.continue();
  }
}
