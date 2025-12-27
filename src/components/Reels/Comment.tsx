import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, MessageCircle, Loader, X, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react/headless';

import 'tippy.js/dist/tippy.css';
import { DataUtil } from '../../utils/DataUtil';
import { CommentService } from '../../service/commentService';
import { usePostComments } from '../../hooks/usePostComments';
import { createCommentRequest } from '../../redux/features/comment/commentSlice';
import CommentItem from '../Comment/CommentItem';

type CommentProps = {
    reel: any;
    showComments: boolean;
    setShowComments: (v: boolean) => void;
    avatarUrl?: string | null;
    handleClickComment: () => void;
};

function Comment({ reel, showComments, setShowComments, avatarUrl, handleClickComment }: CommentProps) {
    const dispatch = useDispatch();
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyToUsername, setReplyToUsername] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [rootCommentId, setRootCommentId] = useState<number>(0);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const commentsListRef = useRef<HTMLDivElement>(null);

    // Track replies state cho từng comment: { commentId: { replies, cursor, hasMore, loading } }
    const [repliesState, setRepliesState] = useState<Record<string, any>>({});

    // Callback khi nhận comment mới từ socket
    const handleCommentAdded = useCallback((incoming: any) => {
        // 1) Cập nhật danh sách comments (top-level) hoặc tăng repliesCount nếu là reply
        setComments((prev) => {
            // Tránh duplicate
            if (prev.some((c) => c.id === incoming.id)) return prev;

            const isReply = !!incoming?.replyToUser;
            if (!isReply) {
                // Comment gốc → prepend vào danh sách
                return [incoming, ...prev];
            }

            // Là reply → tăng repliesCount cho comment gốc nếu đang có trong list
            const rootId = incoming?.rootCommentId ?? incoming?.rootId ?? incoming?.root ?? null;
            if (!rootId) return prev;

            return prev.map((c) => (c.id === rootId ? { ...c, repliesCount: (c.repliesCount || 0) + 1 } : c));
        });

        // 2) Nếu đang mở replies của comment gốc thì append thêm vào repliesState để hiển thị realtime
        const rootId = incoming?.rootCommentId ?? incoming?.rootId ?? incoming?.root ?? null;
        if (!rootId) return;

        setRepliesState((prev) => {
            const key = rootId.toString();
            const state = prev[key];
            if (!state) return prev; // chưa mở replies → không ép mở

            // Tránh duplicate trong replies
            if (state?.replies?.some((r: any) => r.id === incoming.id)) return prev;

            return {
                ...prev,
                [key]: {
                    ...state,
                    replies: [...(state.replies || []), incoming],
                },
            };
        });
    }, []);

    // Callback khi comment bị xóa từ socket
    const handleCommentDeleted = useCallback(
        (commentId: string) => {
            // 1) Thử xóa ở top-level; nếu không thấy, có thể là reply → giảm repliesCount cho parent nếu tìm thấy trong repliesState
            setComments((prev) => {
                // Nếu xóa được ở top-level thì trả về list đã filter
                if (prev.some((c) => c.id === commentId)) {
                    return prev.filter((c) => c.id !== commentId);
                }

                // Không phải top-level → duyệt qua repliesState để giảm repliesCount cho parent nếu có
                const next = prev.map((c) => {
                    const key = c.id?.toString?.() ?? '';
                    const rs = repliesState[key];
                    if (rs?.replies?.some?.((r: any) => r.id === commentId)) {
                        return { ...c, repliesCount: Math.max(0, (c.repliesCount || 0) - 1) };
                    }
                    return c;
                });
                return next;
            });

            // 2) Xóa trong repliesState nếu nó là reply
            setRepliesState((prev) => {
                const next = { ...prev } as Record<string, any>;
                for (const key of Object.keys(next)) {
                    const state = next[key];
                    if (!state?.replies) continue;
                    if (state.replies.some((r: any) => r.id === commentId)) {
                        next[key] = { ...state, replies: state.replies.filter((r: any) => r.id !== commentId) };
                        break;
                    }
                }
                return next;
            });
        },
        [repliesState],
    );

    usePostComments(reel?.id, showComments, handleCommentAdded, handleCommentDeleted);

    // Fetch comments khi mở popup
    useEffect(() => {
        if (!showComments) return;
        // setRepliesState({});

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

    const handleReplyComment = async (commentId: string, rootCommentId: number, username: string) => {
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

    // const handleViewReplies = async (comment: any) => {
    //     const commentId = comment.id.toString();

    //     // Nếu đã load, toggle show/hide
    //     if (repliesState[commentId]) {
    //         setRepliesState((prev) => ({
    //             ...prev,
    //             [commentId]: {
    //                 ...prev[commentId],
    //                 isShowing: !prev[commentId].isShowing,
    //             },
    //         }));
    //         return;
    //     }

    //     // Load replies lần đầu
    //     setRepliesState((prev) => ({
    //         ...prev,
    //         [commentId]: { replies: [], loading: true, cursor: undefined, hasMore: false, isShowing: true },
    //     }));

    //     try {
    //         const response = await CommentService.getReplies(reel.id, comment.id, 3);
    //         setRepliesState((prev) => ({
    //             ...prev,
    //             [commentId]: {
    //                 replies: response.comments || [],
    //                 loading: false,
    //                 cursor: response.nextCursor,
    //                 hasMore: response.hasMore,
    //                 total: response.total,
    //                 isShowing: true,
    //             },
    //         }));
    //     } catch (error) {
    //         console.error('Failed to fetch replies:', error);
    //         setRepliesState((prev) => ({
    //             ...prev,
    //             [commentId]: { replies: [], loading: false, cursor: undefined, hasMore: false, isShowing: true },
    //         }));
    //     }
    // };

    // const handleLoadMoreReplies = async (comment: any) => {
    //     const commentId = comment.id.toString();
    //     const state = repliesState[commentId];

    //     if (!state || !state.cursor || state.loading) return;

    //     setRepliesState((prev) => ({
    //         ...prev,
    //         [commentId]: { ...prev[commentId], loading: true },
    //     }));

    //     try {
    //         const response = await CommentService.getReplies(reel.id, comment.id, 3, state.cursor);
    //         setRepliesState((prev) => ({
    //             ...prev,
    //             [commentId]: {
    //                 replies: [...(prev[commentId]?.replies || []), ...response.comments],
    //                 loading: false,
    //                 cursor: response.nextCursor,
    //                 hasMore: response.hasMore,
    //                 isShowing: true,
    //             },
    //         }));
    //     } catch (error) {
    //         console.error('Failed to load more replies:', error);
    //     }
    // };

    // const handleLikeReply = async (postId: string, replyId: string, commentId: string) => {
    //     try {
    //         await CommentService.likeComment(postId, replyId);
    //         setRepliesState((prev) => ({
    //             ...prev,
    //             [commentId]: {
    //                 ...prev[commentId],
    //                 replies: prev[commentId].replies.map((r: any) =>
    //                     r.id === replyId
    //                         ? {
    //                               ...r,
    //                               isLiked: !r.isLiked,
    //                               likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
    //                           }
    //                         : r,
    //                 ),
    //             },
    //         }));
    //     } catch (error) {
    //         console.error('Failed to like reply:', error);
    //     }
    // };

    const handleLikeComment = async (postId: string, commentId: string) => {
        try {
            await CommentService.likeComment(postId, commentId);
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

    // console.log('Rendering Comment component with comments:', comments);
    // console.log('Replies state:', repliesState);

    const clearReply = () => {
        setReplyTo(null);
        setReplyToUsername(null);
        setCommentText('');
    };

    const handleComment = async () => {
        let text = commentText.trim();
        if (!text || posting) return;

        if (replyTo && replyToUsername) {
            const mentionPattern = `@${replyToUsername} `;
            if (text.startsWith(mentionPattern)) {
                text = text.slice(mentionPattern.length).trim();
            }
        }

        // ✅ Kiểm tra text có nội dung không (sau khi bỏ @tên)
        if (!text) return;

        setCommentText('');
        setReplyTo(null);
        setReplyToUsername(null);

        // ✅ Dispatch Redux action → Saga xử lý → Server save + emit broadcast
        dispatch(
            createCommentRequest({
                postId: reel.id,
                text,
                rootCommentId: rootCommentId,
                replyToCommentId: replyTo ? parseInt(replyTo) : undefined,
            }),
        );

        // Server sẽ emit 'comment_added' broadcast
        // usePostComments hook sẽ nhận và cập nhật UI realtime cho tất cả tabs
    };

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
                                        <CommentItem
                                            key={c.id}
                                            c={c}
                                            idx={idx}
                                            reel={reel}
                                            // repliesState={repliesState}
                                            handleReplyComment={handleReplyComment}
                                            handleLikeComment={handleLikeComment}
                                            // handleViewReplies={handleViewReplies}
                                            // handleLikeReply={handleLikeReply}
                                            // handleLoadMoreReplies={handleLoadMoreReplies}
                                        />
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
                                <span className="truncate">Replying to @{replyToUsername}</span>
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
                                        ref={inputRef}
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
                <button onClick={() => handleClickComment()} className="flex flex-col items-center">
                    <MessageCircle className="w-7 h-7 text-black" />
                    <span className="text-black text-xs mt-1">{reel?.commentsCount?.toLocaleString?.() || 0}</span>
                </button>
            </Tippy>
        </>
    );
}

export default Comment;
