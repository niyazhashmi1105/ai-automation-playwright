import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient, type Query } from './BaseApiClient';
import type { NewPost, Post } from '../types';

export class PostsClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, '/posts');
  }

  list(query?: Query) {
    return this.get<Post[]>('', { params: query });
  }

  getById(id: number) {
    return this.get<Post>(`/${id}`);
  }

  create(post: NewPost) {
    return this.post<Post>('', post);
  }

  replace(id: number, post: Post) {
    return this.put<Post>(`/${id}`, post);
  }

  update(id: number, changes: Partial<Post>) {
    return this.patch<Post>(`/${id}`, changes);
  }

  remove(id: number) {
    return this.delete<Record<string, never>>(`/${id}`);
  }
}
