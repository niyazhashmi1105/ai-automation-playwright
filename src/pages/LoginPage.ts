import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ErrorBanner } from '../components';
import { ROUTES } from '../../config/constants';
import { step } from '../utils/helpers';
import type { User } from '../types';

export class LoginPage extends BasePage {
  protected readonly path = ROUTES.login;
  readonly error: ErrorBanner;

  constructor(page: Page) {
    super(page);
    this.error = new ErrorBanner(page);
  }

  protected get pageReadyLocator() {
    return this.loginButton;
  }

  get usernameInput() {
    return this.page.getByTestId('username');
  }

  get passwordInput() {
    return this.page.getByTestId('password');
  }

  get loginButton() {
    return this.page.getByTestId('login-button');
  }

  async login(user: User): Promise<void> {
    await step(`Log in as "${user.username || '<empty>'}"`, async () => {
      await this.usernameInput.fill(user.username);
      await this.passwordInput.fill(user.password);
      await this.loginButton.click();
    });
  }
}
