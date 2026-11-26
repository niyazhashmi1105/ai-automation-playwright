import {
  test,
  expect,
  readJson,
  validateSchema,
  postSchema,
  postListSchema,
  API_MAX_RESPONSE_MS,
  type ApiData,
} from '../../src/fixtures';

const { postFilters } = readJson<ApiData>('api.json');

test.describe('Posts API', () => {
  test('list posts: status, schema, response time', { tag: ['@smoke', '@api'] }, async ({ postsApi }) => {
    const res = await postsApi.list();
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.length).toBeGreaterThan(0);
    expect(validateSchema(res.body, postListSchema).errors).toEqual([]);
    expect(res.durationMs).toBeLessThan(API_MAX_RESPONSE_MS);
  });

  test('get post by id', { tag: ['@smoke', '@api'] }, async ({ postsApi, apiData }) => {
    const res = await postsApi.getById(apiData.existingPostId);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(apiData.existingPostId);
    expect(validateSchema(res.body, postSchema).errors).toEqual([]);
  });

  test('get missing post returns 404', { tag: ['@regression', '@api'] }, async ({ postsApi, apiData }) => {
    const res = await postsApi.getById(apiData.missingPostId);
    expect(res.status).toBe(404);
    expect(res.ok).toBe(false);
  });

  test('create post returns 201 with id', { tag: ['@smoke', '@api'] }, async ({ postsApi, apiData }) => {
    const res = await postsApi.create(apiData.newPost);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(apiData.newPost);
    expect(typeof res.body.id).toBe('number');
  });

  test('replace post with PUT', { tag: ['@regression', '@api'] }, async ({ postsApi, apiData }) => {
    const res = await postsApi.replace(apiData.updatedPost.id, apiData.updatedPost);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(apiData.updatedPost);
  });

  test('update post with PATCH', { tag: ['@regression', '@api'] }, async ({ postsApi, apiData }) => {
    const res = await postsApi.update(apiData.existingPostId, apiData.patch);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ...apiData.patch, id: apiData.existingPostId });
    expect(validateSchema(res.body, postSchema).errors).toEqual([]);
  });

  test('delete post', { tag: ['@regression', '@api'] }, async ({ postsApi, apiData }) => {
    const res = await postsApi.remove(apiData.existingPostId);
    expect(res.status).toBe(200);
  });

  for (const row of postFilters) {
    test(`query filter: ${row.title}`, { tag: ['@regression', '@api'] }, async ({ postsApi }) => {
      const res = await postsApi.list(row.query);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(row.expectedCount);
      for (const post of res.body) expect(post[row.field]).toBe(row.expectedValue);
    });
  }
});
