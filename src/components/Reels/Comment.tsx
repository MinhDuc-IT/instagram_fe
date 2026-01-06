import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, Loader, X, Smile } from 'lucide-react';
import Tippy from '@tippyjs/react/headless';

import 'tippy.js/dist/tippy.css';
import { CommentService } from '../../service/commentService';
import { usePostComments } from '../../hooks/usePostComments';
import { createCommentRequest, getCommentsRequest, updateLikeComment } from '../../redux/features/comment/commentSlice';
import CommentItem from '../Comment/CommentItem';
import { COMMENTS_PAGE_SIZE } from '../../constants/filters';
import EmojiPicker from '../Common/EmojiPicker';

type CommentProps = {
    reel: any;
    showComments: boolean;
    setShowComments: (v: boolean) => void;
    avatarUrl?: string | null;
    handleClickComment: () => void;
};

function Comment({ reel, showComments, setShowComments, avatarUrl, handleClickComment }: CommentProps) {
    const dispatch = useDispatch();
    const loading = useSelector((state: any) => state.comment.loading);
    const comments = useSelector((state: any) => state.comment.comments);
    const cursor = useSelector((state: any) => state.comment.cursor);
    const hasMore = useSelector((state: any) => state.comment.hasMore);
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyToUsername, setReplyToUsername] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [commentText, setCommentText] = useState<string>('');
    const [posting, setPosting] = useState(false);
    const [rootCommentId, setRootCommentId] = useState<number>(0);
    const commentsListRef = useRef<HTMLDivElement>(null);

    usePostComments(reel?.id, showComments);

    useEffect(() => {
        if (!showComments) return;

        const fetchComments = async () => {
            dispatch(getCommentsRequest({ postId: reel.id, page: COMMENTS_PAGE_SIZE }));
        };

        fetchComments();
    }, [reel.id, showComments]);

    const handleCommentsScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const { scrollHeight, scrollTop, clientHeight } = element;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom && hasMore && !loading && cursor) {
            dispatch(getCommentsRequest({ postId: reel.id, page: COMMENTS_PAGE_SIZE, cursor }));
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

    const handleLikeComment = async (postId: string, commentId: string) => {
        try {
            await CommentService.likeComment(postId, commentId);
            const commentsAfterLike = comments.map((c: any) =>
                c.id === commentId
                    ? {
                        ...c,
                        isLiked: !c.isLiked,
                        likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
                    }
                    : c,
            );
            dispatch(updateLikeComment({ comments: commentsAfterLike }));
        } catch (error) {
            console.error('Failed to like comment:', error);
        }
    };

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
                                            key={c?.id || idx}
                                            c={c}
                                            idx={idx}
                                            reel={reel}
                                            handleReplyComment={handleReplyComment}
                                            handleLikeComment={handleLikeComment}
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
                                    <EmojiPicker
                                        onEmojiSelect={(emoji) => setCommentText(commentText + emoji)}
                                        placement="top-end"
                                    />
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
