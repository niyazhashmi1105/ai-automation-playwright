import type { Schema } from '../utils/schemaValidator';

/** API contracts. Keep in sync with src/types. */
export const postSchema: Schema = {
  id: 'number',
  userId: 'number',
  title: 'string',
  body: 'string',
};

export const postListSchema: Schema = [postSchema];

export const userSchema: Schema = {
  id: 'number',
  name: 'string',
  username: 'string',
  email: 'string',
  phone: 'string',
  website: 'string',
  address: {
    street: 'string',
    suite: 'string',
    city: 'string',
    zipcode: 'string',
    geo: { lat: 'string', lng: 'string' },
  },
  company: { name: 'string', catchPhrase: 'string', bs: 'string' },
};

export const userListSchema: Schema = [userSchema];
