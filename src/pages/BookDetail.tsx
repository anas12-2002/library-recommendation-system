import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getBook } from '@/services/api';
import { mockBooks } from '@/services/mockData'; // استيراد مباشر للـ mock data
import { Book } from '@/types';
import { formatRating } from '@/utils/formatters';
import { handleApiError } from '@/utils/errorHandling';

/**
 * BookDetail page component
 */
export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 [BookDetail] Component mounted');
    console.log('📌 [BookDetail] Book ID from URL:', id);

    if (id) {
      loadBook(id);
    } else {
      console.error('❌ [BookDetail] No book ID provided in URL');
      setError('No book ID provided');
      setIsLoading(false);
    }
  }, [id]);

  const loadBook = async (bookId: string) => {
    console.log('📖 [BookDetail] loadBook called with ID:', bookId);
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 [BookDetail] Calling getBook API...');

      // محاولة جلب الكتاب من API
      const data = await getBook(bookId);

      console.log('📦 [BookDetail] getBook returned:', data);

      if (data) {
        console.log('✅ [BookDetail] Book loaded successfully:', data.title);
        setBook(data);
      } else {
        // Fallback: البحث مباشرة في mockBooks
        console.log('⚠️ [BookDetail] API returned null, trying mock data...');
        const mockBook = mockBooks.find((b) => b.id === bookId);

        if (mockBook) {
          console.log('✅ [BookDetail] Found in mock data:', mockBook.title);
          setBook(mockBook);
        } else {
          console.error('❌ [BookDetail] Book not found anywhere');
          setError(`Book with ID "${bookId}" not found`);
        }
      }
    } catch (error) {
      console.error('💥 [BookDetail] Error loading book:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load book: ${errorMessage}`);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Implement add to reading list functionality
  const handleAddToList = () => {
    alert('Add to reading list functionality coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="glass-effect p-8 rounded-2xl border border-white/20 shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Book</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <div className="flex flex-col gap-3 mt-6">
            <Button variant="primary" onClick={() => navigate('/books')}>
              ← Back to Books
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="glass-effect p-8 rounded-2xl border border-white/20 shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Book Not Found</h2>
          <p className="text-slate-600 mb-4">
            The book with ID{' '}
            <span className="font-mono bg-slate-100 px-2 py-1 rounded">"{id}"</span> doesn't exist.
          </p>
          <p className="text-sm text-slate-500 mb-6">Available book IDs: 1 through 10</p>
          <Button variant="primary" onClick={() => navigate('/books')}>
            Browse Available Books
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-violet-600 mb-8 transition-colors group glass-effect px-4 py-2 rounded-xl border border-white/20 w-fit"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-semibold">Back</span>
        </button>

        <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 md:p-12">
            <div className="md:col-span-1">
              <div className="relative group">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full rounded-2xl shadow-2xl group-hover:shadow-glow transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Cover';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-slate-600 mb-6 font-medium">by {book.author}</p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl border border-amber-200 shadow-sm">
                  <svg
                    className="w-5 h-5 text-amber-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-amber-700">
                    {formatRating(book.rating)}
                  </span>
                </div>

                <span className="badge-gradient px-4 py-2 text-sm">{book.genre}</span>

                <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-semibold">{book.publishedYear}</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full mr-3"></span>
                  Description
                </h2>
                <p className="text-slate-700 leading-relaxed text-lg">{book.description}</p>
              </div>

              <div className="mb-8 glass-effect p-4 rounded-xl border border-white/20">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">ISBN:</span> {book.isbn}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" onClick={handleAddToList}>
                  <svg
                    className="w-5 h-5 mr-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add to Reading List
                </Button>
                <Button variant="outline" size="lg">
                  <svg
                    className="w-5 h-5 mr-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Write a Review
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* TODO: Implement reviews section */}
        <div className="mt-8 glass-effect rounded-3xl shadow-xl border border-white/20 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
            <span className="w-1 h-8 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full mr-3"></span>
            Reviews
          </h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <p className="text-slate-600 text-lg">Reviews section coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
