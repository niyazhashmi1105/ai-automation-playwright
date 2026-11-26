import { expect, type Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { step } from '../utils/helpers';

export class SideMenu extends BaseComponent {
  constructor(page: Page) {
    super(page, page.locator('.bm-menu-wrap'));
  }

  private get openButton() {
    return this.page.getByRole('button', { name: 'Open Menu' });
  }

  private get closeButton() {
    return this.page.getByRole('button', { name: 'Close Menu' });
  }

  async open(): Promise<void> {
    await step('Open side menu', async () => {
      await this.openButton.click();
      await expect(this.root).toBeVisible();
    });
  }

  async close(): Promise<void> {
    await step('Close side menu', async () => {
      await this.closeButton.click();
      await expect(this.root).toBeHidden();
    });
  }

  async logout(): Promise<void> {
    await step('Log out via side menu', async () => {
      await this.open();
      await this.page.getByTestId('logout-sidebar-link').click();
    });
  }

  async resetAppState(): Promise<void> {
    await step('Reset app state', async () => {
      await this.open();
      await this.page.getByTestId('reset-sidebar-link').click();
      await this.close();
    });
  }
}
