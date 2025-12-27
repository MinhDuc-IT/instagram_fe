'use client';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState, useRef, use } from 'react';

import { Post } from '../types/post.type';
import { PostService } from '../service/postService';
import { toggleLikePost, toggleSavePost, addCommentToPost } from '../redux/features/user/userSlice';
import { createCommentRequest } from '../redux/features/comment/commentSlice';
import PostEditModal from './PostEditModal';
import { RootState, AppDispatch } from '../redux/store';
import CommentItem from './Comment/CommentItem';
import { usePostComments } from '../hooks/usePostComments';

interface PostModalProps {
    post: Post;
    onClose: () => void;
    scrollToCommentId?: number | null;
}

export default function PostModal({ post, onClose, scrollToCommentId }: PostModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const p =
        useSelector((state: any) => state.users.userPosts.find((postItem: Post) => postItem.id === post.id)) || post;
    console.log('PostModal rendering with post:', p);

    const [detail, setDetail] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [animating, setAnimating] = useState(true);
    const mountedRef = useRef(false);
    const [edit, setEdit] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyToUsername, setReplyToUsername] = useState<string | null>(null);
    const [rootCommentId, setRootCommentId] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const commentsContainerRef = useRef<HTMLDivElement>(null);

    usePostComments(post.id.toString(), true);

    useEffect(() => {
        mountedRef.current = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await PostService.getById(post.id);
                console.log('Fetched post detail:', res);
                // PostService returns response.data (see axios interceptor)
                const p = res?.data || res;
                setDetail(p);
                setCurrentIndex(0);
            } catch (err) {
                console.error('Error loading post detail:', err);
                setDetail(post);
            } finally {
                setLoading(false);
            }
        };

        load();

        // animation: remove initial scale after mount
        const timer = setTimeout(() => setAnimating(false), 200);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
        };
    }, [post]);

    // Scroll to comment when scrollToCommentId is set
    useEffect(() => {
        if (scrollToCommentId && detail && commentsContainerRef.current) {
            // Wait for comments to render
            const timer = setTimeout(() => {
                const commentElement = commentsContainerRef.current?.querySelector(
                    `[data-comment-id="${scrollToCommentId}"]`,
                ) as HTMLElement;
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight the comment briefly
                    commentElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
                    setTimeout(() => {
                        commentElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
                    }, 2000);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [scrollToCommentId, detail]);

    if (!post) return null;

    // const p = detail || post;

    const prev = () => setCurrentIndex((s) => (s - 1 + (p.media?.length || 1)) % (p.media?.length || 1));
    const next = () => setCurrentIndex((s) => (s + 1) % (p.media?.length || 1));

    const toggleLike = async () => {
        if (!p) return;
        const currentPost = detail || post;
        const originalIsLiked = currentPost.isLiked ?? false;
        const originalLikes = currentPost.likes ?? 0;
        const newIsLiked = !originalIsLiked;
        const newLikes = originalLikes + (originalIsLiked ? -1 : 1);

        // optimistic update local + global
        const updated = { ...currentPost, isLiked: newIsLiked, likes: newLikes };
        setDetail(updated);
        dispatch(toggleLikePost({ postId: currentPost.id, isLiked: newIsLiked, likes: newLikes }));

        try {
            await PostService.like(currentPost.id);
        } catch (err) {
            console.error('Like API failed', err);
            // Rollback on error
            setDetail(currentPost);
            dispatch(toggleLikePost({ postId: currentPost.id, isLiked: originalIsLiked, likes: originalLikes }));
        }
    };

    const handleReplyComment = (commentId: string, rootCommentId: number, username: string) => {
        setReplyTo(commentId);
        setReplyToUsername(username);
        setRootCommentId(rootCommentId);
        const text = `@${username} `;
        setCommentText(text);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(text.length, text.length);
            }
        }, 0);
    };

    const handleLikeComment = (reelId: string, commentId: string) => {};

    const toggleSave = async () => {
        if (!p) return;
        const currentPost = detail || post;
        const originalIsSaved = currentPost.isSaved ?? false;
        const newIsSaved = !originalIsSaved;

        // optimistic update local + global
        const updated = { ...currentPost, isSaved: newIsSaved };
        setDetail(updated);
        dispatch(toggleSavePost({ postId: currentPost.id, isSaved: newIsSaved }));

        try {
            await PostService.save(currentPost.id);
        } catch (err) {
            console.error('Save API failed', err);
            // Rollback on error
            setDetail(currentPost);
            dispatch(toggleSavePost({ postId: currentPost.id, isSaved: originalIsSaved }));
        }
    };

    const sendComment = async () => {
        let text = commentText;
        if (!p || !text.trim()) return;
        const now = new Date().toISOString();
        const newComment = {
            id: Date.now(),
            userId: 0,
            username: 'You',
            userAvatar: null,
            content: commentText.trim(),
            replyTo: null,
            createdAt: now,
            updatedAt: now,
        };
        const originalComments = p.comments || [];

        // optimistic append local + global
        setDetail((d) => (d ? { ...d, comments: [...originalComments, newComment] } : d));
        // dispatch(addCommentToPost({ postId: p.id, comment: newComment }));

        if (replyTo && replyToUsername) {
            const mentionPattern = `@${replyToUsername} `;
            if (text.startsWith(mentionPattern)) {
                text = text.slice(mentionPattern.length).trim();
            }
        }
        if (!text) return;

        setCommentText('');
        setReplyTo(null);
        setReplyToUsername(null);

        try {
            // await PostService.comment(p.id, newComment.content);
            dispatch(
                createCommentRequest({
                    postId: p.id,
                    text,
                    rootCommentId: rootCommentId,
                    replyToCommentId: replyTo ? parseInt(replyTo) : undefined,
                }),
            );
        } catch (err) {
            console.error('Comment API failed', err);
            // Rollback on error
            setDetail((d) => (d ? { ...d, comments: originalComments } : d));
            dispatch(addCommentToPost({ postId: p.id, comment: newComment })); // This needs a rollback action or we remove it
        }
    };

    const isOwner = String(p.userId) === String(currentUser?.id);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity ${animating ? 'opacity-0' : 'opacity-100'}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={`bg-white dark:bg-gray-900 rounded-lg w-[1000px] h-[670px] overflow-hidden flex transform transition-all duration-200 ${animating ? 'scale-95' : 'scale-100'}`}
            >
                {/* Left: Carousel Media */}
                <div className="w-2/3 bg-black flex items-center justify-center relative">
                    {loading ? (
                        <div className="text-white">Loading...</div>
                    ) : p.media && p.media.length > 0 ? (
                        <>
                            <div className="w-full h-full flex items-center justify-center">
                                {p.media[currentIndex].type === 'video' ? (
                                    <video
                                        src={p.media[currentIndex].url}
                                        controls
                                        className="max-h-[90vh] object-contain w-full"
                                    />
                                ) : (
                                    <img
                                        src={p.media[currentIndex].url}
                                        alt={p.caption || 'Post media'}
                                        className="max-h-[90vh] object-contain w-full"
                                    />
                                )}
                            </div>

                            {p.media.length > 1 && (
                                <>
                                    <button
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prev();
                                        }}
                                    >
                                        <ChevronLeft color="white" />
                                    </button>
                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            next();
                                        }}
                                    >
                                        <ChevronRight color="white" />
                                    </button>
                                </>
                            )}

                            {/* dots */}
                            {p.media.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                    {p.media.map((_: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-white p-8">No media</div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="w-1/3 flex flex-col">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={p.userAvatar || '/placeholder.svg'}
                                alt={p.username}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                                <span className="font-semibold">{p.username}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(p.timestamp || Date.now()).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="relative flex items-center gap-2">
                            {isOwner && (
                                <button className="p-1" onClick={() => setShowMenu((v) => !v)}>
                                    <MoreHorizontal />
                                </button>
                            )}

                            <button className="p-1" onClick={onClose} aria-label="Close">
                                <X />
                            </button>

                            {/* Dropdown menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => {
                                            setEdit(true);
                                            setShowMenu(false);
                                        }}
                                    >
                                        Edit post
                                    </button>

                                    <button className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Delete post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments / Caption area */}
                    <div className="p-4 overflow-y-auto flex-1" ref={commentsContainerRef}>
                        {/* Caption */}
                        {p.caption && (
                            <div className="mb-4">
                                <div className="flex items-start gap-3">
                                    <img
                                        src={p.userAvatar || '/placeholder.svg'}
                                        alt={p.username}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold">{p.username}</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">{p.caption}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments list */}
                        <div className="space-y-3">
                            {p.comments && p.comments.length > 0 ? (
                                p.comments.map((c: any, index: number) => (
                                    // <div key={c.id} className="flex items-start gap-3">
                                    //     <img src={c.userAvatar || '/placeholder.svg'} className="w-8 h-8 rounded-full object-cover" />
                                    //     <div>
                                    //         <div className="font-semibold text-sm">{c.username}</div>
                                    //         <div className="text-sm text-gray-700 dark:text-gray-300">{c.content}</div>
                                    //     </div>
                                    // </div>
                                    <CommentItem
                                        c={c}
                                        idx={index}
                                        reel={p}
                                        handleLikeComment={handleLikeComment}
                                        handleReplyComment={handleReplyComment}
                                    />
                                ))
                            ) : (
                                // <div className="text-sm text-gray-500">Comments rendering not implemented yet</div>
                                <div className="text-sm text-gray-500">No comments yet</div>
                            )}
                        </div>
                    </div>

                    {/* Actions & counts */}
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    aria-label="Like"
                                    onClick={toggleLike}
                                    className="flex items-center gap-2 transition-colors"
                                >
                                    <Heart
                                        size={24}
                                        fill={p.isLiked ? '#ef4444' : 'none'}
                                        stroke={p.isLiked ? '#ef4444' : 'currentColor'}
                                        className={p.isLiked ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}
                                    />
                                </button>
                                <button aria-label="Comment" className="flex items-center gap-2">
                                    <MessageCircle size={24} className="text-gray-700 dark:text-gray-300" />
                                </button>
                                <button
                                    aria-label="Save"
                                    onClick={toggleSave}
                                    className="flex items-center gap-2 transition-colors"
                                >
                                    <Bookmark
                                        size={24}
                                        fill={p.isSaved ? '#2563eb' : 'none'}
                                        stroke={p.isSaved ? '#2563eb' : 'currentColor'}
                                        className={p.isSaved ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}
                                    />
                                </button>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 font-bold">
                                {(p.likes ?? 0).toLocaleString()} lượt thích
                            </div>
                        </div>
                        {/* Add comment input + send button */}
                        <div className="mt-3 flex gap-2">
                            <input
                                ref={inputRef}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded focus:outline-none"
                            />
                            <button onClick={sendComment} className="btn-primary">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {edit && <PostEditModal post={p} onClose={() => setEdit(false)} />}
        </div>
    );
}
