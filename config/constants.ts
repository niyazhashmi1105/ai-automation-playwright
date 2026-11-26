import path from 'node:path';

export const ROOT_DIR = path.resolve(__dirname, '..');
export const AUTH_DIR = path.join(ROOT_DIR, '.auth');
export const STORAGE_STATE = path.join(AUTH_DIR, 'user.json');
export const TEST_DATA_DIR = path.join(ROOT_DIR, 'test-data');

export const TEST_ID_ATTR = 'data-test';

export const TIMEOUTS = {
  test: 60_000,
  expect: 10_000,
  action: 15_000,
  navigation: 30_000,
} as const;

/** Upper bound for API response-time assertions (ms). Generous: public endpoints vary. */
export const API_MAX_RESPONSE_MS = 3_000;

export const TAGS = {
  smoke: '@smoke',
  regression: '@regression',
  web: '@web',
  api: '@api',
  e2e: '@e2e',
} as const;

export const ROUTES = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
  checkoutInfo: '/checkout-step-one.html',
  checkoutOverview: '/checkout-step-two.html',
  checkoutComplete: '/checkout-complete.html',
} as const;
