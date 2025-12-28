'use client';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState, useRef, use } from 'react';

import { Post } from '../types/post.type';
import { PostService } from '../service/postService';
import { toggleLikePost, toggleSavePost, addCommentToPost } from '../redux/features/user/userSlice';
import { createCommentRequest, addCommentFromSocket } from '../redux/features/comment/commentSlice';
import { CommentService } from '../service/commentService';
import PostEditModal from './PostEditModal';
import { RootState, AppDispatch } from '../redux/store';
import CommentItem from './Comment/CommentItem';
import { usePostComments } from '../hooks/usePostComments';
import { DataUtil } from '../utils/DataUtil';

interface PostModalProps {
    post: Post;
    onClose: () => void;
    scrollToCommentId?: number | null;
    onShareToStory?: (post: Post) => void;
}

export default function PostModal({ post, onClose, scrollToCommentId, onShareToStory }: PostModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const reduxPost =
        useSelector((state: any) => state.users.userPosts.find((postItem: Post) => postItem.id === post.id)) || post;

    const [detail, setDetail] = useState<Post | null>(null);
    const p = detail || reduxPost;

    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [animating, setAnimating] = useState(true);
    const mountedRef = useRef(false);
    const [edit, setEdit] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyToUsername, setReplyToUsername] = useState<string | null>(null);
    const [rootCommentId, setRootCommentId] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const commentsContainerRef = useRef<HTMLDivElement>(null);
    const [showFullCaption, setShowFullCaption] = useState(false)

    const captionLimit = 100
    const needsTruncate = (post.caption?.length ?? 0) > captionLimit;

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

    const handleLikeComment = async (reelId: string, commentId: string) => {
        if (!detail) return;

        const originalComments = [...(detail.comments || [])];
        const commentIndex = originalComments.findIndex((c: any) => c.id === commentId);

        if (commentIndex === -1) return;

        const comment = originalComments[commentIndex] as any;
        const newIsLiked = !comment.isLiked;
        const newLikesCount = comment.likesCount + (newIsLiked ? 1 : -1);

        const updatedComments = [...originalComments];
        updatedComments[commentIndex] = {
            ...comment,
            isLiked: newIsLiked,
            likesCount: newLikesCount,
        };

        setDetail({ ...detail, comments: updatedComments });

        try {
            await CommentService.likeComment(reelId, commentId);
        } catch (error) {
            console.error('Failed to like comment:', error);
            setDetail({ ...detail, comments: originalComments });
        }
    };

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
        const tempId = Date.now();

        // Remove mention prefix for the actual text content if it exists
        if (replyTo && replyToUsername) {
            const mentionPattern = `@${replyToUsername} `;
            if (text.startsWith(mentionPattern)) {
                text = text.slice(mentionPattern.length).trim();
            }
        }

        if (!text) return;

        const newComment = {
            id: tempId,
            userId: Number(currentUser?.id || 0),
            username: currentUser?.username || 'You',
            userAvatar: currentUser?.avatar || null,
            content: text, // Use the cleaned text
            text: text, // For compatibility if some component uses 'text'
            replyTo: replyTo,
            replyToUser: replyTo ? { userName: replyToUsername } : null,
            rootCommentId: rootCommentId,
            createdAt: now,
            updatedAt: now,
            likesCount: 0,
            repliesCount: 0,
            isLiked: false
        } as any;

        const originalComments = p.comments || [];

        // UI Update
        if (replyTo) {
            // 1. Update reply count in root comment (in detail state)
            if (detail && detail.comments) {
                const updatedComments = detail.comments.map((c: any) => {
                    if (c.id === rootCommentId) {
                        return { ...c, repliesCount: (c.repliesCount || 0) + 1 };
                    }
                    return c;
                });
                setDetail({ ...detail, comments: updatedComments });
            }

            // 2. Dispatch action to show reply in CommentItem list
            // We reuse addCommentFromSocket because it handles appending to the correct reply list
            dispatch(addCommentFromSocket(newComment));
        } else {
            // Root comment: Append to main list
            setDetail((d) => (d ? { ...d, comments: [...(originalComments), newComment] } : d));
        }

        // Reset input
        setCommentText('');
        setReplyTo(null);
        setReplyToUsername(null);

        try {
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
            // Note: Rollback logic is complex due to mixed state (local detail vs redux slices). 
            // Ideally we should reload comments on failure.
        }
    };

    const isOwner = String(p.userId) === String(currentUser?.id);

    const toggleCaption = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowFullCaption(!showFullCaption)
    }
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
                                    {DataUtil.timeAgo(p.timestamp)}
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
                    <div className="p-4 overflow-y-auto flex-1 border-b dark:border-gray-800" ref={commentsContainerRef}>
                        {/* Caption */}
                        {p.caption && (
                            <div className="mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="relative">
                                        <img
                                            src={p.userAvatar || '/placeholder.svg'}
                                            alt={p.username}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="inline-block mr-2 font-semibold text-sm">{p.username}</div>
                                        <span className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                            <span className="text-gray-900">
                                                {needsTruncate && !showFullCaption
                                                    ? p.caption.slice(0, captionLimit) + '...'
                                                    : p.caption
                                                }
                                            </span>
                                            {needsTruncate && (
                                                <button
                                                    onClick={toggleCaption}
                                                    className="text-blue-500 ml-1 hover:text-blue-700"
                                                >
                                                    {showFullCaption ? ' thu gọn' : ' xem thêm'}
                                                </button>
                                            )}
                                        </span>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {DataUtil.timeAgo(p.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments list */}
                        {!p.isCommentsDisabled ? (
                            <div className="space-y-4">
                                {p.comments && p.comments.length > 0 ? (
                                    p.comments.map((c: any, index: number) => (
                                        <CommentItem
                                            key={c.id || index}
                                            c={c}
                                            idx={index}
                                            reel={p}
                                            handleLikeComment={handleLikeComment}
                                            handleReplyComment={handleReplyComment}
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="text-xl font-bold mb-2">No comments yet.</div>
                                        <div className="text-sm text-gray-500">Start the conversation.</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <div className="text-sm text-gray-500">Comments are disabled for this post.</div>
                            </div>
                        )}
                    </div>

                    {/* Actions & counts */}
                    <div className="p-4 bg-white dark:bg-gray-900 z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <button
                                    aria-label="Like"
                                    onClick={toggleLike}
                                    className="hover:opacity-60 transition"
                                >
                                    <Heart
                                        size={24}
                                        fill={p.isLiked ? '#ff3040' : 'none'}
                                        stroke={p.isLiked ? '#ff3040' : 'currentColor'}
                                        className={p.isLiked ? 'text-red-500' : 'text-black dark:text-white'}
                                    />
                                </button>
                                <button aria-label="Comment" className="hover:opacity-60 transition" onClick={() => inputRef.current?.focus()}>
                                    <MessageCircle size={24} className="text-black dark:text-white -rotate-90" />
                                </button>
                                <div className="relative">
                                    <button
                                        aria-label="Share"
                                        className="hover:opacity-60 transition"
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                    >
                                        <svg aria-label="Share Post" className="text-black dark:text-white" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                                    </button>
                                    {showShareMenu && (
                                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50 w-48 overflow-hidden">
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                                                onClick={() => {
                                                    onShareToStory?.(p);
                                                    setShowShareMenu(false);
                                                }}
                                            >
                                                Add to story
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    setShowShareMenu(false);
                                                    alert('Link copied!');
                                                }}
                                            >
                                                Copy link
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                aria-label="Save"
                                onClick={toggleSave}
                                className="hover:opacity-60 transition"
                            >
                                <Bookmark
                                    size={24}
                                    fill={p.isSaved ? 'blue' : 'none'}
                                    stroke={p.isSaved ? 'blue' : 'currentColor'}
                                    className={p.isSaved ? 'text-blue blue:text-white' : 'text-blue blue:text-white'}
                                />
                            </button>
                        </div>

                        {!p.isLikesHidden && (p.likes ?? 0) > 0 && (
                            <div className="text-sm font-semibold mb-1 text-black dark:text-white">
                                {(p.likes ?? 0).toLocaleString()} likes
                            </div>
                        )}

                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-3">
                            {DataUtil.timeAgo(p.timestamp)}
                        </div>

                        {/* Add comment input + send button */}
                        {!p.isCommentsDisabled && (
                            <div className="flex items-center gap-2 border-t pt-3 dark:border-gray-800">
                                <button className="p-2">
                                    <svg aria-label="Emoji" className="text-gray-500" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg>
                                </button>
                                <input
                                    ref={inputRef}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-transparent text-sm focus:outline-none"
                                />
                                {commentText.trim().length > 0 && (
                                    <button onClick={sendComment} className="text-blue-500 font-semibold text-sm hover:text-blue-700">
                                        Post
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {edit && <PostEditModal post={p} onClose={() => setEdit(false)} />}
        </div>
    );
}
