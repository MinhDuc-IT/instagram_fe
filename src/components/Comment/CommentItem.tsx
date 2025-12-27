import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, Loader } from 'lucide-react';

import { CommentService } from '../../service/commentService';
import { DataUtil } from '../../utils/DataUtil';
import { getRepliesRequest, toggleRepliesVisibility, updateReplies } from '../../redux/features/comment/commentSlice';

type CommentItemProps = {
    c: any;
    idx: number;
    reel: any;
    handleReplyComment: (commentId: string, rootCommentId: number, username: string) => void;
    handleLikeComment: (reelId: any, commentId: any) => void;
};

export default function CommentItem({ c, idx, reel, handleReplyComment, handleLikeComment }: CommentItemProps) {
    const dispatch = useDispatch();
    const repliesState = useSelector((state: any) => state.comment.repliesComments);

    const handleViewReplies = (comment: any) => {
        const commentId = comment.id.toString();

        // Nếu đã load, toggle show/hide
        if (repliesState[commentId]) {
            dispatch(toggleRepliesVisibility({ commentId }));
            return;
        }

        // Load replies lần đầu
        dispatch(
            getRepliesRequest({
                postId: reel.id,
                commentId: comment.id,
                page: 3,
                cursor: undefined,
            }),
        );
    };

    const handleLoadMoreReplies = (comment: any) => {
        const commentId = comment.id.toString();
        const state = repliesState[commentId];

        if (!state || !state.cursor || state.loading) return;

        dispatch(
            getRepliesRequest({
                postId: reel.id,
                commentId: comment.id,
                page: 20,
                cursor: state.cursor,
            }),
        );
    };

    const handleLikeReply = async (postId: string, replyId: string, commentId: string) => {
        try {
            await CommentService.likeComment(postId, replyId);
            // Update replies state
            const replies = repliesState[commentId]?.replies || [];
            const updatedReplies = replies.map((r: any) =>
                r.id === replyId
                    ? {
                          ...r,
                          isLiked: !r.isLiked,
                          likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
                      }
                    : r,
            );

            dispatch(updateReplies({ commentId, replies: updatedReplies }));
        } catch (error) {
            console.error('Failed to like reply:', error);
        }
    };

    return (
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
                                onClick={() => handleReplyComment(c.id, c.id, c?.username)}
                                className="font-semibold"
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                    <button onClick={() => handleLikeComment(reel.id, c.id)} className="p-1">
                        <Heart
                            className={`w-4 h-4 ${c?.isLiked ? 'text-[#fc323e]' : 'text-black'}`}
                            fill={c?.isLiked ? '#fc323e' : 'none'}
                        />
                    </button>
                </div>

                {c?.repliesCount > 0 && !repliesState[c.id.toString()]?.isShowing && (
                    <button
                        onClick={() => handleViewReplies(c)}
                        className="flex items-center gap-2 mt-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                        <div className="w-6 h-px bg-gray-300" />
                        <span>View all {c?.repliesCount || 0} replies</span>
                        {repliesState[c.id.toString()]?.loading && (
                            <Loader className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                    </button>
                )}

                {c.id && repliesState[c.id.toString()]?.isShowing && (
                    <div className="mt-2 space-y-2 border-gray-200">
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
                                    src={reply?.userAvatar || `https://i.pravatar.cc/150?img=${reply.userId}`}
                                    alt={reply?.username}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 text-xs">
                                    <div className="flex items-start justify-between gap-1">
                                        <div className="flex-1">
                                            <span className="font-semibold text-sm">{reply?.username}</span>
                                            <span className="ml-1 text-gray-500">
                                                {DataUtil.formatCommentTime(reply?.createdAt)}
                                            </span>
                                            <p className="text-sm mt-1">
                                                {reply?.replyToUser ? (
                                                    <>
                                                        <Link
                                                            to={`/profile/${reply?.replyToUser?.id}`}
                                                            className="text-blue-500 font-semibold hover:underline"
                                                        >
                                                            @{reply?.replyToUser?.userName}
                                                        </Link>{' '}
                                                    </>
                                                ) : null}
                                                {reply?.text}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleLikeReply(reel.id, reply.id, c.id.toString())}
                                            className="p-1 flex-shrink-0"
                                        >
                                            <Heart
                                                className={`w-4 h-4 ${reply?.isLiked ? 'text-[#fc323e]' : 'text-gray-400'}`}
                                                fill={reply?.isLiked ? '#fc323e' : 'none'}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span className="text-xs">
                                            {DataUtil.formatlikeCount(reply?.likesCount || 0)}{' '}
                                            {reply?.likesCount > 1 ? 'likes' : 'like'}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleReplyComment(reply.id, reply.rootCommentId, reply?.username)
                                            }
                                            className="hover:text-gray-700 text-xs"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {repliesState[c.id.toString()]?.hasMore && (
                            <button
                                onClick={() => handleLoadMoreReplies(c)}
                                disabled={repliesState[c.id.toString()]?.loading}
                                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-semibold"
                            >
                                <div className="w-6 h-px bg-gray-300" />
                                <span>View more replies</span>
                                {repliesState[c.id.toString()]?.loading && (
                                    <Loader className="w-4 h-4 animate-spin text-gray-400" />
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
