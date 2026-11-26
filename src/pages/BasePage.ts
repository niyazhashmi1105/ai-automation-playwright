import { expect, type Locator, type Page } from '@playwright/test';
import { step } from '../utils/helpers';

export abstract class BasePage {
  /** Path relative to baseURL, e.g. "/inventory.html". */
  protected abstract readonly path: string;
  /** Element that proves the page finished loading. */
  protected abstract get pageReadyLocator(): Locator;

  constructor(protected readonly page: Page) {}

  get url(): string {
    return this.page.url();
  }

  async open(): Promise<this> {
    await step(`Open ${this.constructor.name}`, async () => {
      await this.page.goto(this.path);
      await this.waitForLoaded();
    });
    return this;
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.pageReadyLocator).toBeVisible();
  }

  async expectOnPage(): Promise<void> {
    await step(`On ${this.constructor.name}`, async () => {
      await expect(this.page).toHaveURL(new RegExp(`${escapeRegex(this.path)}$`));
      await this.waitForLoaded();
    });
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
