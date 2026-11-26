// ---------- Web test data ----------
export interface User {
  username: string;
  /** Usually "{{env:WEB_PASSWORD}}" — resolved at read time, never committed. */
  password: string;
}

export interface InvalidLoginCase {
  title: string;
  username: string;
  password: string;
  expectedError: string;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface CheckoutValidationCase {
  title: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  expectedError: string;
}

export interface Product {
  name: string;
  price: number;
}

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export interface SortCase {
  title: string;
  option: SortOption;
  by: 'name' | 'price';
  direction: 'asc' | 'desc';
}

export interface WebData {
  users: { standard: User; locked: User };
  invalidLogins: InvalidLoginCase[];
  checkout: CheckoutInfo;
  checkoutValidation: CheckoutValidationCase[];
  products: { journey: Product[]; single: Product };
  sortCases: SortCase[];
  taxRate: number;
}

// ---------- API models ----------
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type NewPost = Omit<Post, 'id'>;

export interface Geo {
  lat: string;
  lng: string;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface PostFilterCase {
  title: string;
  query: Record<string, string | number>;
  expectedCount: number;
  field: keyof Post;
  expectedValue: string | number;
}

export interface ApiData {
  newPost: NewPost;
  updatedPost: Post;
  patch: Partial<Post>;
  existingPostId: number;
  missingPostId: number;
  existingUserId: number;
  missingUserId: number;
  postFilters: PostFilterCase[];
}
