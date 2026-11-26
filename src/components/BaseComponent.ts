import type { Locator, Page } from '@playwright/test';

/** A UI part scoped to a root locator, composed into pages. */
export abstract class BaseComponent {
  constructor(
    protected readonly page: Page,
    readonly root: Locator,
  ) {}
}
