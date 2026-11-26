import { test as base } from '@playwright/test';
import { readJson } from '../utils/dataReader';
import type { ApiData, WebData } from '../types';

export interface DataFixtures {
  webData: WebData;
  apiData: ApiData;
}

/** Fresh deep copy per test — mutate freely. */
export const dataTest = base.extend<DataFixtures>({
  webData: async ({}, use) => use(readJson<WebData>('web.json')),
  apiData: async ({}, use) => use(readJson<ApiData>('api.json')),
});
