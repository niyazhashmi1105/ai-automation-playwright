import { mergeTests } from '@playwright/test';
import { pageTest } from './page.fixtures';
import { apiTest } from './api.fixtures';
import { dataTest } from './data.fixtures';

/** The only import specs need. */
export const test = mergeTests(pageTest, apiTest, dataTest);
export { expect } from '@playwright/test';

// Re-exports so specs never reach into src/ internals.
export { readJson, resolvePlaceholders } from '../utils/dataReader';
export { validateSchema } from '../utils/schemaValidator';
export { sum, roundMoney, isSortedAsc, isSortedDesc } from '../utils/helpers';
export * as random from '../utils/randomData';
export * from '../api/schemas';
export { TAGS, API_MAX_RESPONSE_MS, ROUTES } from '../../config/constants';
export { env } from '../../config/env';
export type * from '../types';
