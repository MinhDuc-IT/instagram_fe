import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeFeed, fetchMorePosts } from '../redux/features/post/postSlice';
import PostModal from '../components/PostModal';
import { RootState } from '../redux/store';
import { Post } from '../types/post.type';
import { Heart, Play, MessageCircle, Copy } from 'lucide-react';
import { FILTERS } from "../constants/filters"

export default function Explore() {
    const dispatch = useDispatch();
    const { posts = [], loading, loadingMore, hasMore, currentPage } = useSelector((state: RootState) => state.post);

    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef(false);
    const lastPageRef = useRef<number | null>(null);

    // Initial load
    useEffect(() => {
        dispatch(fetchHomeFeed() as any);
    }, [dispatch]);

    // Infinite scroll observer
    useEffect(() => {
        const element = observerTarget.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;

                if (
                    entry.isIntersecting &&
                    !loading &&
                    !loadingMore &&
                    hasMore &&
                    posts.length > 0 &&
                    !isFetchingRef.current
                ) {
                    isFetchingRef.current = true;
                    observer.unobserve(element);
                    dispatch(fetchMorePosts() as any);
                }
            },
            { rootMargin: '200px' },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [dispatch, loading, loadingMore, hasMore, currentPage]);

    useEffect(() => {
        if (currentPage !== lastPageRef.current) {
            lastPageRef.current = currentPage;
            isFetchingRef.current = false;
        }
    }, [currentPage]);

    return (
        <div className="p-4">
            {/* Loading skeleton */}
            {loading && posts.length === 0 && (
                <div className="columns-2 md:columns-3 gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="relative mb-1 bg-gray-300 animate-pulse aspect-square rounded" />
                    ))}
                </div>
            )}

            {/* Masonry Grid */}
            {posts.length > 0 && (
                <div className="columns-2 md:columns-3 gap-1">
                    {posts.map((post) => {
                        const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
                        const isVideo =
                            firstMedia?.type === 'video' || firstMedia?.format === 'mp4' || firstMedia?.duration;
                        const mediaUrl = firstMedia?.url || '/placeholder.svg';
                        const hasMultiple = (post.media?.length ?? 0) > 1;

                        return (
                            <div
                                key={post.id}
                                className="relative mb-1 cursor-pointer group overflow-hidden rounded-lg bg-gray-200"
                                onClick={() => setSelectedPost(post)}
                            >
                                {isVideo ? (
                                    <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
                                        <video
                                            src={mediaUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            playsInline
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Play className="w-5 h-5 text-white fill-white drop-shadow-lg" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={mediaUrl}
                                            alt="Explore post"
                                            className="w-full h-auto object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder.svg';
                                            }}
                                        />
                                        {hasMultiple && (
                                            <div className="absolute top-2 right-2 flex items-center justify-center rounded bg-black/60 px-1.5 py-1">
                                                <Copy className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <Heart className="w-6 h-6 fill-white" />
                                        <span className="font-semibold">{post.likeCount || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <MessageCircle className="w-6 h-6 fill-white" />
                                        <span className="font-semibold">{post.commentsCount}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* No posts message */}
            {!loading && posts.length === 0 && <div className="text-center py-12 text-gray-500">No posts to show</div>}

            {/* Infinite scroll trigger */}
            {hasMore && (
                <div ref={observerTarget} className="py-8">
                    {loadingMore && (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                        </div>
                    )}
                </div>
            )}

            {/* End of posts message */}
            {!loading && !hasMore && posts.length > 0 && <div className="text-center py-8 text-gray-500 text-sm"></div>}
            {/* {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">You've reached the end! 🎉</div>
            )} */}

            {/* Post Modal */}
            {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
        </div>
    );
}
