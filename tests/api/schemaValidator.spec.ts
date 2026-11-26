import { test, expect, validateSchema, postSchema } from '../../src/fixtures';

/** Guards the contract checker itself: a validator that never fails is worse than none. */
test.describe('Schema validator', () => {
  test('flags wrong types and missing keys', { tag: ['@regression', '@api'] }, async () => {
    const result = validateSchema({ id: '1', userId: 1, title: 'x' }, postSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['$.id: expected number, got string', '$.body: expected string, got undefined']);
  });
});
