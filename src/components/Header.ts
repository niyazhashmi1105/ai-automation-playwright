import { expect, type Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { SideMenu } from './SideMenu';
import { step } from '../utils/helpers';

/** Top app bar shared by every authenticated page. */
export class Header extends BaseComponent {
  readonly menu: SideMenu;

  constructor(page: Page) {
    super(page, page.getByTestId('primary-header'));
    this.menu = new SideMenu(page);
  }

  get cartLink() {
    return this.page.getByTestId('shopping-cart-link');
  }

  get cartBadge() {
    return this.page.getByTestId('shopping-cart-badge');
  }

  get title() {
    return this.page.getByTestId('title');
  }

  async openCart(): Promise<void> {
    await step('Open cart', () => this.cartLink.click());
  }

  async expectCartCount(count: number): Promise<void> {
    await step(`Cart badge shows ${count}`, async () => {
      if (count === 0) await expect(this.cartBadge).toBeHidden();
      else await expect(this.cartBadge).toHaveText(String(count));
    });
  }
}
