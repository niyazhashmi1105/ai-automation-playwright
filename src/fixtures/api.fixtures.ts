import { test as base, request as pwRequest, type APIRequestContext } from '@playwright/test';
import { env } from '../../config/env';
import { PostsClient, UsersClient } from '../api';

export interface ApiFixtures {
  /** Own request context on API_BASE_URL — independent of the web baseURL, so it works in web tests too. */
  apiRequest: APIRequestContext;
  postsApi: PostsClient;
  usersApi: UsersClient;
}

export const apiTest = base.extend<ApiFixtures>({
  apiRequest: async ({}, use) => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (env.apiToken) headers.Authorization = `Bearer ${env.apiToken}`;
    const ctx = await pwRequest.newContext({ baseURL: env.apiBaseUrl, extraHTTPHeaders: headers });
    await use(ctx);
    await ctx.dispose();
  },
  postsApi: async ({ apiRequest }, use) => use(new PostsClient(apiRequest)),
  usersApi: async ({ apiRequest }, use) => use(new UsersClient(apiRequest)),
});
