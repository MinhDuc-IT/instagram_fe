import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Loader, X, Smile, ChevronDown, ChevronUp } from 'lucide-react';
import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import { DataUtil } from '../../utils/DataUtil';
import { CommentService } from '../../service/commentService';
import { usePostComments } from '../../hooks/usePostComments';

type CommentProps = {
    reel: any;
    showComments: boolean;
    setShowComments: (v: boolean) => void;
    avatarUrl?: string | null;
    handleClickComment: (reel: any) => void;
};

function Comment({
    reel,
    showComments,
    setShowComments,
    avatarUrl,
    // commentText,
    // setCommentText,
    handleClickComment,
}: CommentProps) {
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const commentsListRef = useRef<HTMLDivElement>(null);

    // Track replies state cho từng comment: { commentId: { replies, cursor, hasMore, loading } }
    const [repliesState, setRepliesState] = useState<Record<string, any>>({});

    // Callback khi nhận comment mới từ socket
    const handleCommentAdded = useCallback((comment: any) => {
        setComments((prev) => {
            // Kiểm tra không trùng comment (tránh duplicate khi user tự post)
            if (prev.some((c) => c.id === comment.id)) {
                return prev;
            }
            return [comment, ...prev];
        });
    }, []);

    console.log('Replies state:', repliesState);

    // Callback khi comment bị xóa từ socket
    const handleCommentDeleted = useCallback((commentId: string) => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
    }, []);

    // Join/leave post room + lắng nghe socket events
    usePostComments(reel?.id, showComments, handleCommentAdded, handleCommentDeleted);

    // Fetch comments khi mở popup
    useEffect(() => {
        if (!showComments) return;

        const fetchComments = async () => {
            setLoading(true);
            try {
                const response = await CommentService.getComments(reel.id, 20);
                setComments(response.comments);
                setCursor(response.nextCursor);
                setHasMore(response.hasMore);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
                setComments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [reel.id, showComments]);

    // console.log('Comments:', comments);

    // Handle scroll để load thêm comments
    const handleCommentsScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const { scrollHeight, scrollTop, clientHeight } = element;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom && hasMore && !loading && cursor) {
            setLoading(true);
            try {
                const response = await CommentService.getComments(reel.id, 20, cursor);
                setComments((prev) => [...prev, ...response.comments]);
                setCursor(response.nextCursor);
                setHasMore(response.hasMore);
            } catch (error) {
                console.error('Failed to load more comments:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleReplyComment = async (username: string) => {
        console.log('Reply to comment');
        setReplyTo(username);
        setCommentText(`@${username} `);
        // focus input để gõ tiếp
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleViewReplies = async (comment: any) => {
        const commentId = comment.id.toString();

        // Nếu đã load, toggle show/hide
        if (repliesState[commentId]) {
            setRepliesState((prev) => ({
                ...prev,
                [commentId]: {
                    ...prev[commentId],
                    isShowing: !prev[commentId].isShowing,
                },
            }));
            return;
        }

        // Load replies lần đầu
        setRepliesState((prev) => ({
            ...prev,
            [commentId]: { replies: [], loading: true, cursor: undefined, hasMore: true, isShowing: true },
        }));

        try {
            const response = await CommentService.getReplies(reel.id, comment.id, 3);
            setRepliesState((prev) => ({
                ...prev,
                [commentId]: {
                    replies: response.comments || [],
                    loading: false,
                    cursor: response.nextCursor,
                    hasMore: response.hasMore,
                    isShowing: true,
                },
            }));
        } catch (error) {
            console.error('Failed to fetch replies:', error);
            setRepliesState((prev) => ({
                ...prev,
                [commentId]: { replies: [], loading: false, cursor: undefined, hasMore: false, isShowing: true },
            }));
        }
    };

    const handleLoadMoreReplies = async (comment: any) => {
        const commentId = comment.id.toString();
        const state = repliesState[commentId];

        if (!state || !state.cursor || state.loading) return;

        setRepliesState((prev) => ({
            ...prev,
            [commentId]: { ...prev[commentId], loading: true },
        }));

        try {
            const response = await CommentService.getReplies(reel.id, comment.id, 3, state.cursor);
            setRepliesState((prev) => ({
                ...prev,
                [commentId]: {
                    replies: [...(prev[commentId]?.replies || []), ...response.comments],
                    loading: false,
                    cursor: response.nextCursor,
                    hasMore: response.hasMore,
                    isShowing: true,
                },
            }));
        } catch (error) {
            console.error('Failed to load more replies:', error);
        }
    };

    const handleLikeReply = async (replyId: string, commentId: string) => {
        try {
            await CommentService.likeComment(replyId);
            setRepliesState((prev) => ({
                ...prev,
                [commentId]: {
                    ...prev[commentId],
                    replies: prev[commentId].replies.map((r: any) =>
                        r.id === replyId
                            ? {
                                  ...r,
                                  isLiked: !r.isLiked,
                                  likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
                              }
                            : r,
                    ),
                },
            }));
        } catch (error) {
            console.error('Failed to like reply:', error);
        }
    };

    const handleViewAll = () => {
        console.log('View all replies');
    };

    const handleLikeComment = async (commentId: string) => {
        try {
            await CommentService.likeComment(commentId);
            // Toggle isLiked trong comment state
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? {
                              ...c,
                              isLiked: !c.isLiked,
                              likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
                          }
                        : c,
                ),
            );
        } catch (error) {
            console.error('Failed to like comment:', error);
        }
    };

    const clearReply = () => {
        setReplyTo(null);
        setCommentText('');
    };

    const handleComment = async () => {};

    return (
        <>
            <Tippy
                key={reel.id}
                visible={showComments}
                interactive
                placement="right"
                onClickOutside={() => setShowComments(false)}
                popperOptions={{
                    modifiers: [
                        {
                            name: 'flip',
                            options: {
                                fallbackPlacements: ['left', 'bottom', 'top'],
                            },
                        },
                        {
                            name: 'offset',
                            options: {
                                offset: [210, -42],
                            },
                        },
                        {
                            name: 'preventOverflow',
                            options: {
                                padding: 16,
                            },
                        },
                    ],
                }}
                render={(attrs) => (
                    <div
                        className="comment-popup bg-white rounded-2xl shadow-2xl w-[350px] max-w-[calc(100vw-32px)] h-[400px] max-h-[calc(100vh-32px)] flex flex-col animate-scaleIn"
                        tabIndex={-1}
                        {...attrs}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <button
                                onClick={() => setShowComments(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-base font-semibold">Comments</h3>
                            <div className="w-8" />
                        </div>

                        {/* Comments List */}
                        <div
                            className="flex-1 overflow-y-auto px-4 py-2"
                            ref={commentsListRef}
                            onScroll={handleCommentsScroll}
                        >
                            {loading && comments.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            ) : comments?.length > 0 ? (
                                <>
                                    {comments.map((c: any, idx: number) => (
                                        <div key={idx} className="flex gap-3 py-3">
                                            <img
                                                src={c?.userAvatar || `https://i.pravatar.cc/150?img=${idx + 10}`}
                                                alt={c?.username || 'User avatar'}
                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-sm">{c?.username}</span>
                                                        <span className="ml-[5px] text-gray-500 text-xs">
                                                            {DataUtil.formatCommentTime(c?.createdAt)}
                                                        </span>
                                                        <p className="text-sm mt-1">{c?.text}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                            <span>{c?.likesCount || 0} likes</span>
                                                            <button
                                                                onClick={() => handleReplyComment(c?.username)}
                                                                className="font-semibold"
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleLikeComment(c.id)} className="p-1">
                                                        <Heart
                                                            className={`w-4 h-4 ${c?.isLiked ? 'text-[#fc323e]' : 'text-black'}`}
                                                            fill={c?.isLiked ? '#fc323e' : 'none'}
                                                        />
                                                    </button>
                                                </div>

                                                {/* View replies button - trên cùng, chỉ show khi chưa mở */}
                                                {c?.repliesCount > 0 && !repliesState[c.id.toString()]?.isShowing && (
                                                    <button
                                                        onClick={() => handleViewReplies(c)}
                                                        className="flex items-center gap-2 mt-2 text-xs text-gray-500 hover:text-gray-700"
                                                    >
                                                        <div className="w-6 h-px bg-gray-300" />
                                                        <span>View all {c?.repliesCount || 0} replies</span>
                                                    </button>
                                                )}

                                                {/* Hiển thị replies inline */}
                                                {repliesState[c.id.toString()]?.isShowing && (
                                                    <div className="mt-2 space-y-2 border-gray-200">
                                                        {/* Hide replies button - top của replies */}
                                                        <button
                                                            onClick={() => handleViewReplies(c)}
                                                            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
                                                        >
                                                            <div className="w-6 h-px bg-gray-300" />
                                                            <span>Hide all replies</span>
                                                        </button>

                                                        {repliesState[c.id.toString()]?.replies?.map((reply: any) => (
                                                            <div key={reply.id} className="flex gap-2">
                                                                <img
                                                                    src={
                                                                        reply?.userAvatar ||
                                                                        `https://i.pravatar.cc/150?img=${reply.userId}`
                                                                    }
                                                                    alt={reply?.username}
                                                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                                />
                                                                <div className="flex-1 text-xs">
                                                                    <div className="flex items-start justify-between gap-1">
                                                                        <div className="flex-1">
                                                                            <span className="font-semibold text-sm">
                                                                                {reply?.username}
                                                                            </span>
                                                                            <span className="ml-1 text-gray-500">
                                                                                {DataUtil.formatCommentTime(
                                                                                    reply?.createdAt,
                                                                                )}
                                                                            </span>
                                                                            <p className="text-sm mt-1">
                                                                                {reply?.text}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleLikeReply(
                                                                                    reply.id,
                                                                                    c.id.toString(),
                                                                                )
                                                                            }
                                                                            className="p-0.5 flex-shrink-0"
                                                                        >
                                                                            <Heart
                                                                                className={`w-3 h-3 ${reply?.isLiked ? 'text-[#fc323e]' : 'text-gray-400'}`}
                                                                                fill={
                                                                                    reply?.isLiked ? '#fc323e' : 'none'
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                    {/* Reply và Like buttons cho replies */}
                                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                        <span className="text-xs">
                                                                            {DataUtil.formatlikeCount(
                                                                                reply?.likesCount || 0,
                                                                            )}{' '}
                                                                            {reply?.likesCount > 1 ? 'likes' : 'like'}
                                                                        </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleReplyComment(reply?.username)
                                                                            }
                                                                            className="hover:text-gray-700 text-xs"
                                                                        >
                                                                            Reply
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Load more replies button - chỉ show khi còn replies */}
                                                        {repliesState[c.id.toString()]?.hasMore && (
                                                            <button
                                                                onClick={() => handleLoadMoreReplies(c)}
                                                                disabled={repliesState[c.id.toString()]?.loading}
                                                                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-semibold pl-8"
                                                            >
                                                                <div className="w-6 h-px bg-gray-300" />
                                                                {repliesState[c.id.toString()]?.loading
                                                                    ? 'Loading...'
                                                                    : 'View more replies'}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="text-center py-2">
                                            <Loader className="w-4 h-4 animate-spin" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <MessageCircle className="w-16 h-16 text-gray-300 mb-3" />
                                    <p className="text-gray-500 text-sm">No comments yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Start the conversation</p>
                                </div>
                            )}
                        </div>

                        {/* Replying bar */}
                        {replyTo && (
                            <div className="px-4 py-2 bg-gray-100 text-sm text-gray-700 flex items-center justify-between border-t border-gray-200">
                                <span className="truncate">Replying to {replyTo}</span>
                                <button
                                    onClick={clearReply}
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Comment Input */}
                        <div className="border-t border-gray-200 px-4 py-3 bg-white rounded-b-2xl">
                            <div className="flex items-center gap-3">
                                <img
                                    src={avatarUrl || 'https://i.pravatar.cc/150?img=1'}
                                    alt="Your avatar"
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-sm"
                                    />
                                    <button className="p-1">
                                        <Smile className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                {commentText && (
                                    <button
                                        onClick={() => handleComment()}
                                        className="text-blue-500 font-semibold text-sm"
                                    >
                                        Post
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            >
                <button onClick={() => handleClickComment(reel)} className="flex flex-col items-center">
                    <MessageCircle className="w-7 h-7 text-black" />
                    <span className="text-black text-xs mt-1">{reel?.commentsCount?.toLocaleString?.() || 0}</span>
                </button>
            </Tippy>
        </>
    );
}

export default Comment;
