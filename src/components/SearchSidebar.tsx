'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { searchUsersRequest } from '../redux/features/user/userSlice';
import type { RootState } from '../redux/store';

interface SearchSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchSidebar({ isOpen, onClose }: SearchSidebarProps) {
    const dispatch = useDispatch();
    const { searchResults, searchLoading } = useSelector((state: RootState) => state.users);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce search API calls
    useEffect(() => {
        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // If search query is empty, clear results
        if (!searchQuery.trim()) {
            return;
        }

        // Set new timer for debounce (500ms)
        debounceTimerRef.current = setTimeout(() => {
            dispatch(searchUsersRequest({ query: searchQuery.trim(), limit: 20 }));
        }, 500);

        // Cleanup on unmount or when searchQuery changes
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery, dispatch]);

    // Clear search results when sidebar closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
                    isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Search Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-96 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-[60] flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold">Search</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800" ref={searchRef}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto">
                    {searchQuery.trim().length > 0 ? (
                        searchLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="p-2">
                                {searchResults.map((user) => (
                                    <Link
                                        key={user.id}
                                        to={`/profile/${user.id}`}
                                        onClick={() => {
                                            onClose();
                                            setSearchQuery('');
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors rounded-lg"
                                    >
                                        <img
                                            src={user.avatar || '/placeholder.svg'}
                                            alt={user.username || 'avatar'}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{user.username}</p>
                                            {user.fullName && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {user.fullName}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-gray-500 dark:text-gray-400">No users found</p>
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Start typing to search...</p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
