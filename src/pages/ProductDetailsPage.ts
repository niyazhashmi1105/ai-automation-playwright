import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components';
import { parsePrice, step } from '../utils/helpers';

export class ProductDetailsPage extends BasePage {
  protected readonly path = '/inventory-item.html';
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  /** Back button exists only on the details view; inventory-item also matches list cards. */
  protected get pageReadyLocator() {
    return this.page.getByTestId('back-to-products');
  }

  /** URL carries ?id=N, so match the path only. */
  override async expectOnPage(): Promise<void> {
    await step('On ProductDetailsPage', async () => {
      await expect(this.page).toHaveURL(/inventory-item\.html/);
      await this.waitForLoaded();
    });
  }

  get name() {
    return this.page.getByTestId('inventory-item-name');
  }

  async price(): Promise<number> {
    return parsePrice(await this.page.getByTestId('inventory-item-price').innerText());
  }

  async addToCart(): Promise<void> {
    await step('Add product to cart from details', async () => {
      await this.waitForLoaded();
      await this.page.getByRole('button', { name: 'Add to cart' }).click();
      await expect(this.page.getByRole('button', { name: 'Remove' })).toBeVisible();
    });
  }

  async backToProducts(): Promise<void> {
    await step('Back to products', () => this.page.getByTestId('back-to-products').click());
  }
}
