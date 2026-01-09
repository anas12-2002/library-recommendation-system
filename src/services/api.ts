import { Book, ReadingList, Review } from '@/types';
import { fetchAuthSession } from 'aws-amplify/auth';

// ✅ Week 2: API Gateway base url from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ✅ Week 3: getAuthHeaders()
 * نفس فكرة الدكتور، لكن Typed صح عشان ما يطلع:
 * No overload matches this call
 */

export async function getAuthHeaders() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString(); // ✅ ID token مثل اللي بعثته

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * ============================================================================
 * BOOKS
 * ============================================================================
 */

// ✅ Week 2: GET /books
export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books`);
  if (!response.ok) throw new Error('Failed to fetch books');

  const data = await response.json();

  // الحالة الطبيعية: يرجع Array
  if (Array.isArray(data)) return data;

  // حالات شائعة من Lambda/DynamoDB wrappers
  if (Array.isArray(data.books)) return data.books;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.Items)) return data.Items;

  // بعض اللامبدا ترجع body كسلسلة JSON
  if (typeof data.body === 'string') {
    try {
      const parsed = JSON.parse(data.body);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed.books)) return parsed.books;
      if (Array.isArray(parsed.items)) return parsed.items;
      if (Array.isArray(parsed.Items)) return parsed.Items;
    } catch {
      // ignore
    }
  }

  return [];
}

// ✅ Week 2: GET /books/{id}
export async function getBook(id: string): Promise<Book | null> {
  const response = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch book');
  return response.json();
}

/**
 * (Admin) باقي مثل ما هو في المشروع — إذا عندك Lambda له، فعّلهم بنفس أسلوب reading-lists
 * حالياً نخليهم موجودين عشان imports ما تنكسر.
 */
export async function createBook(book: Omit<Book, 'id'>): Promise<Book> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    headers,
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error('Failed to create book');
  return response.json();
}

export async function updateBook(id: string, book: Partial<Book>): Promise<Book> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error('Failed to update book');
  return response.json();
}

// export async function deleteBook(id: string): Promise<void> {
//   const headers = await getAuthHeaders();
//   const response = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(id)}`, {
//     method: 'DELETE',
//     headers,
//   });
//   if (!response.ok) throw new Error('Failed to delete book');
// }

/**
 * ============================================================================
 * RECOMMENDATIONS (Bedrock)
 * ============================================================================
 */

// ✅ Week 4: POST /recommendations with { query }
export async function getRecommendations(query: string) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json', // ✅ تأكيد
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to get recommendations');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.recommendations ?? []);
}

/**
 * ============================================================================
 * READING LISTS
 * ============================================================================
 */

// ✅ Week 2/3: GET /reading-lists (protected)
export async function getReadingLists(): Promise<ReadingList[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists`, { headers });
  if (!response.ok) throw new Error('Failed to fetch reading lists');
  return response.json();
}

// ✅ Week 2/3: POST /reading-lists (protected)
export async function createReadingList(
  list: Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingList> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists`, {
    method: 'POST',
    headers,
    body: JSON.stringify(list),
  });
  if (!response.ok) throw new Error('Failed to create reading list');
  return response.json();
}

// ✅ Week 3: PUT /reading-lists/{id} (protected)
export async function updateReadingList(
  id: string,
  list: Partial<ReadingList>
): Promise<ReadingList> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(list),
  });
  if (!response.ok) throw new Error('Failed to update reading list');
  return response.json();
}

// ✅ Week 3: DELETE /reading-lists/{id} (protected)
export async function deleteReadingList(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error('Failed to delete reading list');
}

/**
 * ============================================================================
 * REVIEWS (إذا الدكتور ما طلبها ضمن AWS، خليها لاحقاً)
 * ============================================================================
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getReviews(_bookId: string): Promise<Review[]> {
  // إذا عندك endpoint فعلي للـ reviews على AWS، ابعتلي المسارات وبدّي أفعّلها مثل الباقي.
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createReview(_review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  throw new Error('Reviews API not implemented on backend');
}
