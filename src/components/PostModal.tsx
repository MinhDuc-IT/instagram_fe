'use client';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Bookmark, MoreHorizontal, Smile } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState, useRef } from 'react';

import { Post } from '../types/post.type';
import { PostService } from '../service/postService';
import { toggleLikePost, toggleSavePost, addCommentToPost } from '../redux/features/user/userSlice';
import { createCommentRequest, addCommentFromSocket } from '../redux/features/comment/commentSlice';
import { setModalVideoPlaying } from '../redux/features/post/postSlice';
import { CommentService } from '../service/commentService';
import PostEditModal from './PostEditModal';
import { RootState, AppDispatch } from '../redux/store';
import CommentItem from './Comment/CommentItem';
import { usePostComments } from '../hooks/usePostComments';
import { DataUtil } from '../utils/DataUtil';
import EmojiPicker from './Common/EmojiPicker';
import { FILTERS } from '../constants/filters';

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
    const [showFullCaption, setShowFullCaption] = useState(false);

    const captionLimit = 100;
    const needsTruncate = (post.caption?.length ?? 0) > captionLimit;

    usePostComments(post.id.toString(), true);

    useEffect(() => {
        mountedRef.current = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await PostService.getById(post.id);
                console.log('Fetched post detail:', res);
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

        const timer = setTimeout(() => setAnimating(false), 200);

        return () => {
            mountedRef.current = false;
            dispatch(setModalVideoPlaying(false));
            clearTimeout(timer);
        };
    }, [post]);

    useEffect(() => {
        if (scrollToCommentId && detail && commentsContainerRef.current) {
            const timer = setTimeout(() => {
                const commentElement = commentsContainerRef.current?.querySelector(
                    `[data-comment-id="${scrollToCommentId}"]`,
                ) as HTMLElement;
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    const prev = () => setCurrentIndex((s) => (s - 1 + (p.media?.length || 1)) % (p.media?.length || 1));
    const next = () => setCurrentIndex((s) => (s + 1) % (p.media?.length || 1));

    const toggleLike = async () => {
        if (!p) return;
        const currentPost = detail || post;
        const originalIsLiked = currentPost.isLiked ?? false;
        const originalLikes = currentPost.likes ?? 0;
        const newIsLiked = !originalIsLiked;
        const newLikes = originalLikes + (originalIsLiked ? -1 : 1);

        const updated = { ...currentPost, isLiked: newIsLiked, likes: newLikes };
        setDetail(updated);
        dispatch(toggleLikePost({ postId: currentPost.id, isLiked: newIsLiked, likes: newLikes }));

        try {
            await PostService.like(currentPost.id);
        } catch (err) {
            console.error('Like API failed', err);
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

        const updated = { ...currentPost, isSaved: newIsSaved };
        setDetail(updated);
        dispatch(toggleSavePost({ postId: currentPost.id, isSaved: newIsSaved }));

        try {
            await PostService.save(currentPost.id);
        } catch (err) {
            console.error('Save API failed', err);
            setDetail(currentPost);
            dispatch(toggleSavePost({ postId: currentPost.id, isSaved: originalIsSaved }));
        }
    };

    const sendComment = async () => {
        let text = commentText;
        if (!p || !text.trim()) return;
        const now = new Date().toISOString();
        const tempId = Date.now();

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
            content: text,
            text: text,
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

        if (replyTo) {
            if (detail && detail.comments) {
                const updatedComments = detail.comments.map((c: any) => {
                    if (c.id === rootCommentId) {
                        return { ...c, repliesCount: (c.repliesCount || 0) + 1 };
                    }
                    return c;
                });
                setDetail({ ...detail, comments: updatedComments });
            }
        } else {
            setDetail((d) => (d ? { ...d, comments: [...(originalComments), newComment] } : d));
        }

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
        }
    };

    const isOwner = String(p.userId) === String(currentUser?.id);

    const toggleCaption = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowFullCaption(!showFullCaption);
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={`bg-white dark:bg-gray-900 rounded-lg max-w-[1200px] w-[95vw] h-[90vh] max-h-[800px] overflow-hidden flex shadow-2xl transform transition-all duration-300 ${animating ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}
            >
                {/* Left: Media Carousel */}
                <div className="w-[60%] bg-black flex items-center justify-center relative">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-3 border-gray-600 border-t-white rounded-full animate-spin"></div>
                            <span className="text-white text-sm">Loading...</span>
                        </div>
                    ) : p.media && p.media.length > 0 ? (
                        <>
                            <div className="w-full h-full flex items-center justify-center">
                                {p.media[currentIndex].type === 'video' ? (
                                    <video
                                        src={p.media[currentIndex].url}
                                        controls
                                        className="max-h-full max-w-full object-contain"
                                        onPlay={() => dispatch(setModalVideoPlaying(true))}
                                        onPause={() => dispatch(setModalVideoPlaying(false))}
                                    />
                                ) : (
                                    <img
                                        src={p.media[currentIndex].url}
                                        alt={p.caption || 'Post media'}
                                        className="max-h-full max-w-full object-contain"
                                        style={{
                                            filter: FILTERS.find((f: any) => f.name === p.media[currentIndex].filter)?.filter || 'none'
                                        }}
                                    />
                                )}
                            </div>

                            {p.media.length > 1 && (
                                <>
                                    <button
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prev();
                                        }}
                                    >
                                        <ChevronLeft size={24} className="text-black dark:text-white" />
                                    </button>
                                    <button
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            next();
                                        }}
                                    >
                                        <ChevronRight size={24} className="text-black dark:text-white" />
                                    </button>
                                </>
                            )}

                            {p.media.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {p.media.map((_: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${idx === currentIndex ? 'bg-white w-2 h-2' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-white/50 p-8">No media available</div>
                    )}
                </div>

                {/* Right: Details Panel */}
                <div className="w-[40%] flex flex-col bg-white dark:bg-gray-900">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img
                                src={p.userAvatar || '/placeholder.svg'}
                                alt={p.username}
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm hover:opacity-70 transition cursor-pointer truncate">
                                    {p.username}
                                </span>
                                {p.location && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.location}</span>
                                )}
                            </div>
                        </div>
                        <div className="relative flex items-center gap-1 flex-shrink-0">
                            {isOwner && (
                                <button
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                                    onClick={() => setShowMenu((v) => !v)}
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                            )}

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50 overflow-hidden">
                                    <button
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                                        onClick={() => {
                                            setEdit(true);
                                            setShowMenu(false);
                                        }}
                                    >
                                        Edit post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700" ref={commentsContainerRef}>
                        {/* Caption as First Comment */}
                        {p.caption && (
                            <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-start gap-3">
                                    <img
                                        src={p.userAvatar || '/placeholder.svg'}
                                        alt={p.username}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100 dark:ring-gray-800"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm">
                                            <span className="font-semibold mr-2">{p.username}</span>
                                            <span className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                                                {needsTruncate && !showFullCaption
                                                    ? p.caption.slice(0, captionLimit) + '...'
                                                    : p.caption
                                                }
                                            </span>
                                            {needsTruncate && (
                                                <button
                                                    onClick={toggleCaption}
                                                    className="text-gray-500 dark:text-gray-400 ml-1 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                                                >
                                                    {showFullCaption ? 'thu gọn' : 'xem thêm'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {DataUtil.timeAgo(p.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments List */}
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
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <MessageCircle size={48} className="text-gray-300 dark:text-gray-700 mb-3" strokeWidth={1.5} />
                                        <p className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">No comments yet</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Start the conversation.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <MessageCircle size={48} className="text-gray-300 dark:text-gray-700 mb-3" strokeWidth={1.5} />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Comments are disabled for this post.</p>
                            </div>
                        )}
                    </div>

                    {/* Actions & Input Section */}
                    <div className="border-t border-gray-200 dark:border-gray-800">
                        {/* Action Buttons */}
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="flex items-center gap-4">
                                <button
                                    aria-label="Like"
                                    onClick={toggleLike}
                                    className="hover:opacity-60 transition-opacity transform active:scale-95"
                                >
                                    <Heart
                                        size={24}
                                        fill={p.isLiked ? '#ed4956' : 'none'}
                                        stroke={p.isLiked ? '#ed4956' : 'currentColor'}
                                        className={p.isLiked ? '' : 'text-black dark:text-white'}
                                        strokeWidth={2}
                                    />
                                </button>
                                <button
                                    aria-label="Comment"
                                    className="hover:opacity-60 transition-opacity transform active:scale-95"
                                    onClick={() => inputRef.current?.focus()}
                                >
                                    <MessageCircle size={24} className="text-black dark:text-white" strokeWidth={2} />
                                </button>
                                <div className="relative flex items-center">
                                    <button
                                        aria-label="Share"
                                        className="hover:opacity-60 transition-opacity transform active:scale-95 flex items-center"
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                    >
                                        <svg className="text-black dark:text-white" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                                            <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                                            <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
                                        </svg>
                                    </button>
                                    {showShareMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50 w-48 overflow-hidden">
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition"
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
                                className="hover:opacity-60 transition-opacity transform active:scale-95"
                            >
                                <Bookmark
                                    size={24}
                                    fill={p.isSaved ? 'currentColor' : 'none'}
                                    stroke={p.isSaved ? 'none' : 'currentColor'}
                                    className="text-black dark:text-white"
                                    strokeWidth={2}
                                />
                            </button>
                        </div>

                        {/* Likes Count */}
                        {(p.likes ?? 0) > 0 && (
                            <div className="px-4 pb-2">
                                <span className="text-sm font-semibold text-black dark:text-white">
                                    {(p.likes ?? 0).toLocaleString()} {p.likes === 1 ? 'like' : 'likes'}
                                </span>
                            </div>
                        )}

                        {/* Timestamp */}
                        <div className="px-4 pb-3">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {DataUtil.timeAgo(p.timestamp)}
                            </span>
                        </div>

                        {/* Comment Input */}
                        {!p.isCommentsDisabled && (
                            <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                                <EmojiPicker
                                    onEmojiSelect={(emoji) => setCommentText(commentText + emoji)}
                                    className="p-1 hover:opacity-60 transition"
                                    placement="top-start"
                                />
                                <input
                                    ref={inputRef}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-transparent text-sm focus:outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                                {commentText.trim().length > 0 && (
                                    <button
                                        onClick={sendComment}
                                        className="text-blue-500 font-semibold text-sm hover:text-blue-700 dark:hover:text-blue-400 transition"
                                    >
                                        Post
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Close Button - Outside Modal */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition backdrop-blur-sm"
                aria-label="Close"
            >
                <X size={24} className="text-white" />
            </button>

            {edit && <PostEditModal post={p} onClose={() => setEdit(false)} />}
        </div>
    );
}