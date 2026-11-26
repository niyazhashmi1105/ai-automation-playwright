import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient, type Query } from './BaseApiClient';
import type { ApiUser, Post } from '../types';

export class UsersClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, '/users');
  }

  list(query?: Query) {
    return this.get<ApiUser[]>('', { params: query });
  }

  getById(id: number) {
    return this.get<ApiUser>(`/${id}`);
  }

  postsOf(id: number) {
    return this.get<Post[]>(`/${id}/posts`);
  }
}
