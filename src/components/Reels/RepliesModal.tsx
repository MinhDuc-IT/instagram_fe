import React, { useState, useEffect } from 'react';
import { Heart, Loader, X } from 'lucide-react';
import { CommentService } from '../../service/commentService';
import { DataUtil } from '../../utils/DataUtil';

interface RepliesModalProps {
    postId: string;
    commentId: number;
    commentUsername: string;
    repliesCount: number;
    isOpen: boolean;
    onClose: () => void;
    avatarUrl?: string | null;
}

export default function RepliesModal({
    postId,
    commentId,
    commentUsername,
    repliesCount,
    isOpen,
    onClose,
    avatarUrl,
}: RepliesModalProps) {
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [replyText, setReplyText] = useState('');

    // Fetch replies khi mở modal
    useEffect(() => {
        if (!isOpen) return;

        const fetchReplies = async () => {
            setLoading(true);
            try {
                const response = await CommentService.getReplies(postId, commentId, 10);
                setReplies(response.comments || []);
                setCursor(response.nextCursor);
                setHasMore(response.hasMore);
            } catch (error) {
                console.error('Failed to fetch replies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReplies();
    }, [isOpen, postId, commentId]);

    const handleLoadMore = async () => {
        if (!cursor || loading) return;

        setLoading(true);
        try {
            const response = await CommentService.getReplies(postId, commentId, 10, cursor);
            setReplies((prev) => [...prev, ...response.comments]);
            setCursor(response.nextCursor);
            setHasMore(response.hasMore);
        } catch (error) {
            console.error('Failed to load more replies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLikeReply = async (replyId: string) => {
        try {
            await CommentService.likeComment(replyId);
            setReplies((prev) =>
                prev.map((r) =>
                    r.id === replyId
                        ? {
                              ...r,
                              isLiked: !r.isLiked,
                              likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
                          }
                        : r,
                ),
            );
        } catch (error) {
            console.error('Failed to like reply:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="text-base font-semibold">Replies to {commentUsername}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Replies List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {loading && replies.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : replies.length > 0 ? (
                        <>
                            {replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3 py-2">
                                    <img
                                        src={reply?.userAvatar || `https://i.pravatar.cc/150?img=${reply.userId}`}
                                        alt={reply?.username}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <span className="font-semibold text-sm">{reply?.username}</span>
                                                <span className="ml-2 text-gray-500 text-xs">
                                                    {DataUtil.formatCommentTime(reply?.createdAt)}
                                                </span>
                                                <p className="text-sm mt-1">{reply?.text}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span>{reply?.likesCount || 0} likes</span>
                                                    <button className="font-semibold hover:text-gray-700">Reply</button>
                                                </div>
                                            </div>
                                            <button onClick={() => handleLikeReply(reply.id)} className="p-1">
                                                <Heart
                                                    className={`w-4 h-4 ${reply?.isLiked ? 'text-[#fc323e]' : 'text-gray-400'}`}
                                                    fill={reply?.isLiked ? '#fc323e' : 'none'}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {hasMore && (
                                <div className="flex items-center justify-center pt-2">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                                    >
                                        {loading ? 'Loading...' : 'View More Replies'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No replies yet</p>
                    )}
                </div>

                {/* Reply Input */}
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <img
                            src={avatarUrl || 'https://i.pravatar.cc/150?img=1'}
                            alt="Your avatar"
                            className="w-7 h-7 rounded-full object-cover"
                        />
                        <input
                            type="text"
                            placeholder="Reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {replyText && (
                            <button className="px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-full">
                                Post
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
