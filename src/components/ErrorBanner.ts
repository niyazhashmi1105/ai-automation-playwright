import { expect, type Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { step } from '../utils/helpers';

/** Inline form error shown on login and checkout forms. */
export class ErrorBanner extends BaseComponent {
  constructor(page: Page) {
    super(page, page.getByTestId('error'));
  }

  async expectMessage(message: string | RegExp): Promise<void> {
    await step(`Error shows "${message}"`, () => expect(this.root).toContainText(message));
  }

  async expectHidden(): Promise<void> {
    await expect(this.root).toBeHidden();
  }

  async dismiss(): Promise<void> {
    await step('Dismiss error', async () => {
      await this.page.getByTestId('error-button').click();
      await expect(this.root).toBeHidden();
    });
  }
}
