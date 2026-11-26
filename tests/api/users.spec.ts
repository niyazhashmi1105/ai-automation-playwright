import { test, expect, validateSchema, userSchema, userListSchema, API_MAX_RESPONSE_MS } from '../../src/fixtures';

test.describe('Users API', () => {
  test('list users: status, schema, response time', { tag: ['@smoke', '@api'] }, async ({ usersApi }) => {
    const res = await usersApi.list();
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
    expect(validateSchema(res.body, userListSchema).errors).toEqual([]);
    expect(res.durationMs).toBeLessThan(API_MAX_RESPONSE_MS);
  });

  test('get user by id', { tag: ['@regression', '@api'] }, async ({ usersApi, apiData }) => {
    const res = await usersApi.getById(apiData.existingUserId);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(apiData.existingUserId);
    expect(res.body.email).toMatch(/@/);
    expect(validateSchema(res.body, userSchema).errors).toEqual([]);
  });

  test('get missing user returns 404', { tag: ['@regression', '@api'] }, async ({ usersApi, apiData }) => {
    const res = await usersApi.getById(apiData.missingUserId);
    expect(res.status).toBe(404);
  });

  test('nested posts belong to the user', { tag: ['@regression', '@api'] }, async ({ usersApi, apiData }) => {
    const res = await usersApi.postsOf(apiData.existingUserId);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((p) => p.userId === apiData.existingUserId)).toBe(true);
  });

  test('filter users by username', { tag: ['@regression', '@api'] }, async ({ usersApi }) => {
    const all = await usersApi.list();
    const target = all.body[0];
    const res = await usersApi.list({ username: target.username });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([target]);
  });
});
