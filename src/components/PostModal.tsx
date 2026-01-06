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
import EmojiPicker from './Common/EmojiPicker';

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
            // dispatch(addCommentFromSocket(newComment)); // REMOVED: Duplicates with socket and local state
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
                <div className="w-1/3 flex flex-col border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
                    <div className="flex items-center justify-between p-3.5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <img
                                src={p.userAvatar || '/placeholder.svg'}
                                alt={p.username}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-100 dark:ring-gray-800"
                            />
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm hover:opacity-70 transition cursor-pointer">{p.username}</span>
                                {p.location && <span className="text-xs text-gray-500">{p.location}</span>}
                            </div>
                        </div>
                        <div className="relative flex items-center gap-2">
                            {isOwner && (
                                <button className="p-2 hover:opacity-50 transition" onClick={() => setShowMenu((v) => !v)}>
                                    <MoreHorizontal size={20} />
                                </button>
                            )}

                            <button className="p-2 hover:opacity-50 transition" onClick={onClose} aria-label="Close">
                                <X size={20} />
                            </button>

                            {/* Dropdown menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50 overflow-hidden py-1">
                                    <button
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        onClick={() => {
                                            setEdit(true);
                                            setShowMenu(false);
                                        }}
                                    >
                                        Edit post
                                    </button>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
                                    {/* <button className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
                                        Delete post
                                    </button> */}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments / Caption area */}
                    <div className="p-4 overflow-y-auto flex-1 scrollbar-hide" ref={commentsContainerRef}>
                        {/* Caption */}
                        {p.caption && (
                            <div className="mb-6 group">
                                <div className="flex items-start gap-3">
                                    <div className="relative pt-1">
                                        <img
                                            src={p.userAvatar || '/placeholder.svg'}
                                            alt={p.username}
                                            className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-100 dark:ring-gray-800"
                                        />
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <span className="font-semibold mr-2">{p.username}</span>
                                        <span className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                                            {needsTruncate && !showFullCaption
                                                ? p.caption.slice(0, captionLimit) + '...'
                                                : p.caption
                                            }
                                        </span>
                                        {needsTruncate && (
                                            <button
                                                onClick={toggleCaption}
                                                className="text-gray-500 ml-1 hover:text-gray-900 dark:hover:text-gray-300 text-xs font-medium"
                                            >
                                                {showFullCaption ? ' more' : ' more'}
                                            </button>
                                        )}
                                        <div className="mt-2 text-xs text-gray-500 font-medium">
                                            {DataUtil.timeAgo(p.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments list */}
                        {!p.isCommentsDisabled ? (
                            <div className="space-y-5">
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
                                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                                        <p className="text-lg font-bold mb-1">No comments yet.</p>
                                        <p className="text-sm">Start the conversation.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                                <p className="text-sm">Comments are disabled.</p>
                            </div>
                        )}
                    </div>

                    {/* Actions & counts */}
                    <div className="p-4 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <button
                                    aria-label="Like"
                                    onClick={toggleLike}
                                    className="hover:opacity-50 transition transform active:scale-95"
                                >
                                    <Heart
                                        size={26}
                                        fill={p.isLiked ? '#ff3040' : 'none'}
                                        stroke={p.isLiked ? 'none' : 'currentColor'}
                                        className={p.isLiked ? 'text-[#ff3040]' : 'text-black dark:text-white'}
                                        strokeWidth={1.5}
                                    />
                                </button>
                                <button aria-label="Comment" className="hover:opacity-50 transition transform active:scale-95" onClick={() => inputRef.current?.focus()}>
                                    <MessageCircle size={26} className="text-black dark:text-white -rotate-90" strokeWidth={1.5} />
                                </button>
                                <div className="relative">
                                    <button
                                        aria-label="Share"
                                        className="hover:opacity-50 transition transform active:scale-95"
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                    >
                                        <svg aria-label="Share Post" className="text-black dark:text-white" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                                    </button>
                                    {showShareMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-zinc-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border dark:border-zinc-700 z-50 w-48 overflow-hidden py-1">
                                            {/* <button
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700 text-sm font-medium transition-colors"
                                                onClick={() => {
                                                    onShareToStory?.(p);
                                                    setShowShareMenu(false);
                                                }}
                                            >
                                                Add to story
                                            </button> */}
                                            <div className="h-px bg-gray-100 dark:bg-zinc-700" />
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700 text-sm font-medium transition-colors"
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
                                className="hover:opacity-50 transition transform active:scale-95"
                            >
                                <Bookmark
                                    size={26}
                                    fill={p.isSaved ? 'currentColor' : 'none'}
                                    stroke={p.isSaved ? 'none' : 'currentColor'}
                                    className={p.isSaved ? 'text-blue-500' : 'text-black dark:text-white'}
                                    strokeWidth={1.5}
                                />
                            </button>
                        </div>

                        {(p.likes ?? 0) > 0 && (
                            <div className="text-sm font-semibold mb-1 text-black dark:text-white">
                                {(p.likes ?? 0).toLocaleString()} likes
                            </div>
                        )}

                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-4 font-medium">
                            {DataUtil.timeAgo(p.timestamp)}
                        </div>

                        {/* Add comment input + send button */}
                        {!p.isCommentsDisabled && (
                            <div className="flex items-center gap-3 pt-1 relative">
                                <EmojiPicker
                                    onEmojiSelect={(emoji) => setCommentText(commentText + emoji)}
                                    className="p-1"
                                    placement="top-start"
                                />
                                <input
                                    ref={inputRef}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-transparent text-sm focus:outline-none dark:text-white placeholder-gray-500"
                                />
                                {commentText.trim().length > 0 && (
                                    <button onClick={sendComment} className="text-blue-500 font-semibold text-sm hover:text-blue-700 transition">
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
