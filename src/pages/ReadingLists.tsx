import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  getReadingLists,
  createReadingList,
  updateReadingList,
  deleteReadingList,
} from '@/services/api';
import { ReadingList } from '@/types';
import { formatDate } from '@/utils/formatters';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

/**
 * ReadingLists page component
 */
export function ReadingLists() {
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ReadingList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading reading lists from API...');
      const data = await getReadingLists();
      console.log('📦 Received data:', data);

      if (!data) {
        console.error('❌ No data received');
        setLists([]);
        setError('No data received from server');
      } else if (!Array.isArray(data)) {
        console.error('❌ Data is not an array:', data);
        setLists([]);
        setError('Invalid data format from server');
      } else {
        console.log(`✅ Loaded ${data.length} reading lists`);
        setLists(data);
      }
    } catch (error) {
      console.error('❌ Failed to load reading lists:', error);
      setError('Failed to load reading lists. Please try again.');
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert('Please enter a list name');
      return;
    }

    try {
      const newList = await createReadingList({
        userId: 'test-user-123',
        name: newListName,
        description: newListDescription,
        bookIds: [],
      });

      setLists([newList, ...lists]);
      setIsModalOpen(false);
      setNewListName('');
      setNewListDescription('');
      showSuccess('Reading list created successfully!');
      loadLists();
    } catch (error) {
      console.error('❌ Failed to create list:', error);
      handleApiError(error);
    }
  };

  const handleEditList = (listId: string) => {
    const listToEdit = lists.find((list) => list.id === listId);
    if (!listToEdit) return;

    setEditingList(listToEdit);
    setIsEditModalOpen(true);
  };

  const handleUpdateList = async () => {
    if (!editingList || !editingList.name.trim()) {
      alert('Please enter a list name');
      return;
    }

    try {
      const updatedList = await updateReadingList(editingList.id, {
        name: editingList.name,
        description: editingList.description,
        bookIds: editingList.bookIds,
        userId: editingList.userId || 'test-user-123',
      });

      setLists(lists.map((list) => (list.id === updatedList.id ? updatedList : list)));

      setIsEditModalOpen(false);
      setEditingList(null);
      showSuccess('Reading list updated successfully!');
      loadLists();
    } catch (error) {
      console.error('❌ Failed to update list:', error);
      handleApiError(error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      const listToDelete = lists.find((list) => list.id === listId);
      if (!listToDelete) {
        throw new Error('List not found');
      }

      await deleteReadingList(listId, listToDelete.userId || 'test-user-123');

      setLists(lists.filter((list) => list.id !== listId));
      showSuccess('Reading list deleted successfully!');
      loadLists();
    } catch (error) {
      console.error('❌ Failed to delete list:', error);
      handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Loading your reading lists...</p>
        </div>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Lists</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={loadLists}>
              ↻ Try Again
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              ← Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto">
        <div className="glass-effect rounded-2xl border border-white/20 shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                My Reading Lists
              </h1>
              <p className="text-slate-600">Organize your favorite books into custom lists</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
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
              Create New List
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Total Lists</p>
              <p className="text-2xl font-bold text-blue-900">{lists.length}</p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-xl border border-violet-200">
              <p className="text-sm text-violet-700 font-medium">Total Books</p>
              <p className="text-2xl font-bold text-violet-900">
                {lists.reduce((total, list) => total + (list.bookIds?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium">Last Updated</p>
              <p className="text-2xl font-bold text-emerald-900">
                {lists.length > 0 ? formatDate(lists[0].updatedAt) : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Lists Grid */}
        {lists.length === 0 ? (
          <div className="glass-effect rounded-2xl border border-white/20 shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No reading lists yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Create your first reading list to organize and track your favorite books. You can add
              books, share lists, and get recommendations.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="shadow-lg"
            >
              Create Your First List
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list.id}
                className="group glass-effect rounded-2xl border border-white/20 p-6 hover:shadow-2xl hover:border-violet-300 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => {
                  console.log('Opening list:', list.id);
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-violet-700 transition-colors line-clamp-1">
                      {list.name || 'Unnamed List'}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {list.description || 'No description'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-100 to-violet-200 text-violet-800 px-3 py-1 rounded-full text-sm font-bold">
                    {list.bookIds?.length || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/20">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    <span>Created {formatDate(list.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Updated {formatDate(list.updatedAt)}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditList(list.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create List Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Reading List"
        >
          <div>
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-violet-600"
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
              </div>
              <p className="text-slate-600 mb-4">Organize your books into a custom reading list.</p>
            </div>

            <Input
              label="List Name *"
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g., Summer Reading 2024, Sci-Fi Favorites"
              required
              className="mb-4"
            />

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Describe what this list is about, your reading goals, or theme..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent min-h-[120px] resize-none transition-all"
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">Max 500 characters</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleCreateList}
                className="flex-1 shadow-lg"
                disabled={!newListName.trim()}
              >
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
                Create List
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit List Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingList(null);
          }}
          title="Edit Reading List"
        >
          <div>
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <p className="text-slate-600 mb-4">Update your reading list details.</p>
            </div>

            <Input
              label="List Name *"
              type="text"
              value={editingList?.name || ''}
              onChange={(e) =>
                setEditingList((prev) => (prev ? { ...prev, name: e.target.value } : null))
              }
              placeholder="e.g., Summer Reading 2024, Sci-Fi Favorites"
              required
              className="mb-4"
            />

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={editingList?.description || ''}
                onChange={(e) =>
                  setEditingList((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
                placeholder="Describe what this list is about..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none transition-all"
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">Max 500 characters</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleUpdateList}
                className="flex-1 shadow-lg"
                disabled={!editingList?.name?.trim()}
              >
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Update List
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingList(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
