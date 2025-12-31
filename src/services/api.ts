import { Book, ReadingList, Review, Recommendation } from '@/types';
import { mockBooks, mockReadingLists } from './mockData';

/**
 * ============================================================================
 * API SERVICE LAYER - BACKEND COMMUNICATION
 * ============================================================================
 *
 * ✅ REAL AWS BACKEND CONNECTION
 * All functions now connect to REAL AWS API Gateway
 * Mock data is used as fallback ONLY when AWS is unavailable
 *
 * ============================================================================
 */

// ✅ REAL AWS API GATEWAY URL
const API_BASE_URL = 'https://jqvee48nk3.execute-api.us-east-1.amazonaws.com/dev';

/**
 * Get all books from the catalog - REAL AWS IMPLEMENTATION
 */
export async function getBooks(): Promise<Book[]> {
  console.log('📚 Fetching books from REAL AWS API...');
  console.log(`🌐 URL: ${API_BASE_URL}/books`);

  try {
    const response = await fetch(`${API_BASE_URL}/books`);
    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 Raw API response:', result);

    // Handle Lambda response format: { statusCode, headers, body }
    if (result.body && typeof result.body === 'string') {
      const books = JSON.parse(result.body);
      console.log(`✅ SUCCESS! Got ${books.length} REAL books from AWS DynamoDB`);
      return books;
    }

    // If direct array
    if (Array.isArray(result)) {
      console.log(`✅ Direct array: ${result.length} books`);
      return result;
    }

    console.warn('⚠️ Unexpected response format:', result);
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('❌ Failed to fetch books from AWS:', error);
    console.log('🔄 Falling back to mock data for development...');

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📖 Using mock books (fallback)');
        resolve([...mockBooks]);
      }, 500);
    });
  }
}

/**
 * Get a single book by ID - REAL AWS IMPLEMENTATION
 */
export async function getBook(id: string): Promise<Book | null> {
  console.log(`🔍 Fetching book ${id} from REAL AWS API...`);
  console.log(`🌐 URL: ${API_BASE_URL}/books/${id}`);

  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    console.log('📊 Response status:', response.status);

    if (response.status === 404) {
      console.log('📭 Book not found (404)');
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 Raw API response:', result);

    // Handle Lambda response format
    if (result.body && typeof result.body === 'string') {
      const bookData = JSON.parse(result.body);
      return bookData;
    }

    // Handle direct book object
    if (result.id) {
      console.log(`✅ Book directly: ${result.title}`);
      return result;
    }

    // Handle success wrapper format
    if (result.success && result.book) {
      console.log(`✅ SUCCESS! Got REAL book from AWS: ${result.book.title}`);
      return result.book;
    }

    console.warn('⚠️ Unexpected book response format:', result);
    return null;
  } catch (error) {
    console.error(`❌ Failed to fetch book ${id} from AWS:`, error);

    // Fallback to mock data
    console.log('🔄 Searching in mock data (fallback)...');
    const foundBook = mockBooks.find((book: Book) => book.id === id);
    if (foundBook) {
      console.log(`📖 Found in mock data: ${foundBook.title}`);
      return foundBook;
    }

    console.log('📭 Book not found anywhere');
    return null;
  }
}

/**
 * Get user's reading lists - REAL AWS IMPLEMENTATION
 */
export async function getReadingLists(): Promise<ReadingList[]> {
  console.log('📚 Fetching reading lists from REAL AWS API...');
  console.log(`🌐 URL: ${API_BASE_URL}/reading-lists`);

  try {
    const response = await fetch(`${API_BASE_URL}/reading-lists`);
    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 Raw API response:', result);

    // Handle Lambda response format
    if (result.body && typeof result.body === 'string') {
      const lists = JSON.parse(result.body);
      console.log(`✅ SUCCESS! Got ${lists.length} REAL reading lists from AWS`);
      return lists;
    }

    // If direct array
    if (Array.isArray(result)) {
      console.log(`✅ Direct array: ${result.length} reading lists`);
      return result;
    }

    // If single object
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      console.log('⚠️ API returned object instead of array, converting to array');
      return [result];
    }

    console.warn('⚠️ Unexpected response format, returning empty array');
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch reading lists from AWS:', error);
    console.log('🔄 Falling back to mock data for development...');

    // Return mock data
    console.log('📋 Using mock reading lists (fallback)');
    return [...mockReadingLists];
  }
}

/**
 * Create a new reading list - REAL AWS IMPLEMENTATION
 */
export async function createReadingList(
  list: Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingList> {
  console.log('📝 Creating new reading list on AWS...');
  console.log(`🌐 URL: ${API_BASE_URL}/reading-lists`);
  console.log('📦 Data:', list);

  try {
    const response = await fetch(`${API_BASE_URL}/reading-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(list),
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 API response:', result);

    // Handle Lambda response format
    if (result.body && typeof result.body === 'string') {
      const listData = JSON.parse(result.body);
      return listData.list || listData;
    }

    // Handle success wrapper format
    if (result.success && result.list) {
      return result.list;
    }

    return result;
  } catch (error) {
    console.error('❌ Failed to create reading list on AWS:', error);
    console.log('🔄 Falling back to mock creation...');

    // Mock implementation as fallback
    return new Promise((resolve) => {
      setTimeout(() => {
        const newList: ReadingList = {
          ...list,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log('📋 Created mock list:', newList.name);
        resolve(newList);
      }, 500);
    });
  }
}

/**
 * Update a reading list - REAL AWS IMPLEMENTATION (Week 2)
 * PUT /reading-lists/{id}
 */
export async function updateReadingList(
  id: string,
  list: Partial<ReadingList>
): Promise<ReadingList> {
  console.log(`✏️ Updating reading list ${id} on AWS...`);
  console.log(`🌐 URL: ${API_BASE_URL}/reading-lists/${id}`);
  console.log('📦 Data:', list);

  // Validate required fields
  if (!list.userId) {
    throw new Error('userId is required to update reading list');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reading-lists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(list),
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 API response:', result);

    // Handle Lambda response format
    if (result.body && typeof result.body === 'string') {
      const parsed = JSON.parse(result.body);
      return parsed.list || parsed;
    }

    // Handle success wrapper format
    if (result.success && result.list) {
      return result.list;
    }

    return result;
  } catch (error) {
    console.error(`❌ Failed to update reading list ${id} on AWS:`, error);
    console.log('🔄 Falling back to mock update...');

    // Fallback to mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingList = mockReadingLists.find((l: ReadingList) => l.id === id);
        if (!existingList) {
          throw new Error(`Reading list ${id} not found`);
        }

        const updatedList: ReadingList = {
          ...existingList,
          ...list,
          id,
          updatedAt: new Date().toISOString(),
        };
        console.log(`📋 Updated mock list: ${updatedList.name}`);
        resolve(updatedList);
      }, 500);
    });
  }
}

/**
 * Delete a reading list - REAL AWS IMPLEMENTATION (Week 2)
 * DELETE /reading-lists/{id}?userId={userId}
 */
export async function deleteReadingList(id: string, userId: string): Promise<void> {
  console.log(`🗑️ Deleting reading list ${id} on AWS...`);
  console.log(`🌐 URL: ${API_BASE_URL}/reading-lists/${id}?userId=${userId}`);

  try {
    const response = await fetch(`${API_BASE_URL}/reading-lists/${id}?userId=${userId}`, {
      method: 'DELETE',
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 API response:', result);

    console.log(`✅ Successfully deleted reading list ${id} from AWS`);
  } catch (error) {
    console.error(`❌ Failed to delete reading list ${id} on AWS:`, error);
    console.log('🔄 Falling back to mock deletion...');

    // Fallback to mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✅ Deleted mock list ${id}`);
        resolve();
      }, 300);
    });
  }
}

/**
 * Create a new book (admin only) - REAL AWS IMPLEMENTATION
 */
export async function createBook(book: Omit<Book, 'id'>): Promise<Book> {
  console.log('📝 Creating new book on AWS...');
  console.log(`🌐 URL: ${API_BASE_URL}/books`);
  console.log('📦 Data:', book);

  try {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 API response:', result);

    // Handle Lambda response format
    if (result.body && typeof result.body === 'string') {
      const bookData = JSON.parse(result.body);
      return bookData.book || bookData;
    }

    return result;
  } catch (error) {
    console.error('❌ Failed to create book on AWS:', error);
    console.log('🔄 Falling back to mock creation...');

    // Fallback to mock
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBook: Book = {
          ...book,
          id: Date.now().toString(),
        };
        console.log(`📖 Created mock book: ${newBook.title}`);
        resolve(newBook);
      }, 500);
    });
  }
}

/**
 * Update an existing book (admin only) - REAL AWS IMPLEMENTATION
 */
export async function updateBook(id: string, book: Partial<Book>): Promise<Book> {
  console.log(`✏️ Updating book ${id} on AWS...`);
  console.log(`🌐 URL: ${API_BASE_URL}/books/${id}`);
  console.log('📦 Data:', book);

  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 API response:', result);

    // Handle Lambda response format
    if (result.body && typeof result.body === 'string') {
      const bookData = JSON.parse(result.body);
      return bookData.book || bookData;
    }

    return result;
  } catch (error) {
    console.error(`❌ Failed to update book ${id} on AWS:`, error);
    console.log('🔄 Falling back to mock update...');

    // Fallback to mock
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingBook = mockBooks.find((b: Book) => b.id === id);
        if (!existingBook) {
          throw new Error(`Book ${id} not found`);
        }

        const updatedBook: Book = {
          ...existingBook,
          ...book,
          id,
        };
        console.log(`📖 Updated mock book: ${updatedBook.title}`);
        resolve(updatedBook);
      }, 500);
    });
  }
}

/**
 * Delete a book (admin only) - REAL AWS IMPLEMENTATION
 */
export async function deleteBook(id: string): Promise<void> {
  console.log(`🗑️ Deleting book ${id} on AWS...`);
  console.log(`🌐 URL: ${API_BASE_URL}/books/${id}`);

  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 API response:', result);

    console.log(`✅ Successfully deleted book ${id} from AWS`);
  } catch (error) {
    console.error(`❌ Failed to delete book ${id} on AWS:`, error);
    console.log('🔄 Falling back to mock deletion...');

    // Fallback to mock
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✅ Deleted mock book ${id}`);
        resolve();
      }, 300);
    });
  }
}

/**
 * Get AI-powered book recommendations using Amazon Bedrock
 * TODO: Implement in Week 4
 */
export async function getRecommendations(query?: string): Promise<Recommendation[]> {
  console.log('🤖 Getting AI recommendations (mock for Week 4)...');
  console.log(`🌐 Query: ${query || 'No query provided'}`);

  try {
    // Week 4: Replace with real Bedrock API call
    // const response = await fetch(`${API_BASE_URL}/recommendations`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ query }),
    // });

    // Mock for now - بما يتوافق مع نوع Recommendation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockRecommendations: Recommendation[] = [
          {
            id: '1',
            bookId: '1',
            reason:
              'Based on your interest in philosophical fiction, this book explores themes of choice and regret.',
            confidence: 0.92,
          },
          {
            id: '2',
            bookId: '2',
            reason:
              'If you enjoy science-based thrillers, this space adventure combines humor with hard science.',
            confidence: 0.88,
          },
        ];
        console.log('📊 Generated mock recommendations');
        resolve(mockRecommendations);
      }, 1000);
    });
  } catch (error) {
    console.error('❌ Failed to get recommendations:', error);
    return [];
  }
}

/**
 * Get reviews for a book - REAL AWS IMPLEMENTATION
 */
export async function getReviews(bookId: string): Promise<Review[]> {
  console.log(`💬 Getting reviews for book ${bookId} on AWS...`);
  console.log(`🌐 URL: ${API_BASE_URL}/books/${bookId}/reviews`);

  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/reviews`);
    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 API response:', result);

    // Handle Lambda response format
    if (result.body && typeof result.body === 'string') {
      return JSON.parse(result.body);
    }

    if (Array.isArray(result)) {
      return result;
    }

    return [];
  } catch (error) {
    console.error(`❌ Failed to fetch reviews for book ${bookId}:`, error);
    console.log('🔄 Falling back to mock reviews...');

    // Fallback to mock - بما يتوافق مع نوع Review
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockReviews: Review[] = [
          {
            id: '1',
            bookId,
            userId: '1',
            rating: 5,
            comment: 'Absolutely loved this book! A must-read.',
            createdAt: '2024-11-01T10:00:00Z',
          },
        ];
        resolve(mockReviews);
      }, 500);
    });
  }
}

/**
 * Create a new review - REAL AWS IMPLEMENTATION
 */
export async function createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  console.log('💬 Creating new review on AWS...');
  console.log(`🌐 URL: ${API_BASE_URL}/reviews`);
  console.log('📦 Data:', review);

  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 API response:', result);

    // Handle Lambda response format
    if (result.body && typeof result.body === 'string') {
      return JSON.parse(result.body);
    }

    return result;
  } catch (error) {
    console.error('❌ Failed to create review on AWS:', error);
    console.log('🔄 Falling back to mock creation...');

    // Fallback to mock
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReview: Review = {
          ...review,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        resolve(newReview);
      }, 500);
    });
  }
}

/**
 * Test AWS API connection
 */
export async function testApiConnection(): Promise<boolean> {
  console.log('🔌 Testing AWS API connection...');

  try {
    // Try to fetch books as a test
    const response = await fetch(`${API_BASE_URL}/books`);
    const isConnected = response.ok;

    console.log(
      isConnected ? '✅ AWS API connected successfully!' : '❌ AWS API connection failed'
    );
    console.log('📊 Response status:', response.status);

    return isConnected;
  } catch (error) {
    console.error('❌ AWS API connection error:', error);
    return false;
  }
}

/**
 * Check if reading list endpoints exist
 */
export async function checkReadingListEndpoints(): Promise<{
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
}> {
  const results = {
    get: false,
    post: false,
    put: false,
    delete: false,
  };

  try {
    // Test GET
    const getResponse = await fetch(`${API_BASE_URL}/reading-lists`, { method: 'HEAD' });
    results.get = getResponse.ok;
    console.log(`📋 GET /reading-lists: ${results.get ? '✅ OK' : '❌ Missing'}`);

    // Note: We can't really test POST, PUT, DELETE without making actual requests
    // But we can check if they might exist

    console.log('📋 PUT /reading-lists/{id}: ⚠️ Need to implement in Week 2');
    console.log('📋 DELETE /reading-lists/{id}: ⚠️ Need to implement in Week 2');
  } catch (error) {
    console.error('❌ Error checking endpoints:', error);
  }

  return results;
}
