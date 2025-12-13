import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Play, X, Smile } from 'lucide-react';

import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import { DataUtil } from '../../utils/DataUtil';

type CommentProps = {
    reel: any;
    showComments: boolean;
    setShowComments: (v: boolean) => void;
    avatarUrl?: string | null;
    commentText: string;
    setCommentText: (v: string) => void;
    handleClickComment: (reel: any) => void;
};

function Comment({
    reel,
    showComments,
    setShowComments,
    avatarUrl,
    commentText,
    setCommentText,
    handleClickComment,
}: CommentProps) {
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        setComments(reel.topComments || []);
    }, [reel.id]);

    console.log('Render Comment component: ', reel);

    const fakeComments = [
        {
            username: 'sarah_johnson',
            userAvatar: 'https://i.pravatar.cc/150?img=5',
            text: 'This is absolutely stunning! 😍 How did you capture this moment?',
            likes: 847,
            replies: 12,
        },
        {
            username: 'mike_photo',
            userAvatar: 'https://i.pravatar.cc/150?img=12',
            text: 'The lighting is perfect! What camera are you using?',
            likes: 523,
            replies: 8,
        },
        {
            username: 'emma_travels',
            userAvatar: 'https://i.pravatar.cc/150?img=23',
            text: 'I need to visit this place! Where is this? 🌍',
            likes: 1203,
            replies: 25,
        },
        {
            username: 'alex_creative',
            userAvatar: 'https://i.pravatar.cc/150?img=33',
            text: 'Your content is always top tier! Keep it up 🔥',
            likes: 392,
            replies: 5,
        },
        {
            username: 'linda_art',
            userAvatar: 'https://i.pravatar.cc/150?img=44',
            text: 'The composition is incredible! Love the colors 🎨',
            likes: 651,
            replies: 7,
        },
        {
            username: 'john_explorer',
            userAvatar: 'https://i.pravatar.cc/150?img=15',
            text: 'Been following you for years, still amazed by your work!',
            likes: 429,
            replies: 3,
        },
        {
            username: 'sophie_lifestyle',
            userAvatar: 'https://i.pravatar.cc/150?img=27',
            text: 'This deserves to go viral! Sharing with my friends 💯',
            likes: 782,
            replies: 15,
        },
        {
            username: 'david_tech',
            userAvatar: 'https://i.pravatar.cc/150?img=18',
            text: 'What editing software do you use? The quality is insane!',
            likes: 234,
            replies: 9,
        },
        {
            username: 'maria_foodie',
            userAvatar: 'https://i.pravatar.cc/150?img=38',
            text: 'Obsessed with this! 😍😍😍',
            likes: 567,
            replies: 4,
        },
        {
            username: 'chris_fitness',
            userAvatar: 'https://i.pravatar.cc/150?img=52',
            text: 'Motivation right here! Thanks for sharing 💪',
            likes: 891,
            replies: 11,
        },
        {
            username: 'anna_fashion',
            userAvatar: 'https://i.pravatar.cc/150?img=29',
            text: 'Your aesthetic is everything! ✨',
            likes: 1456,
            replies: 18,
        },
        {
            username: 'tom_gamer',
            userAvatar: 'https://i.pravatar.cc/150?img=41',
            text: 'This is why I love Instagram! Pure talent 🎯',
            likes: 312,
            replies: 6,
        },
        {
            username: 'olivia_music',
            userAvatar: 'https://i.pravatar.cc/150?img=31',
            text: 'Can I use this as inspiration for my next project?',
            likes: 445,
            replies: 2,
        },
        {
            username: 'james_writer',
            userAvatar: 'https://i.pravatar.cc/150?img=22',
            text: 'Words cannot describe how beautiful this is 🌟',
            likes: 678,
            replies: 10,
        },
        {
            username: 'rachel_yoga',
            userAvatar: 'https://i.pravatar.cc/150?img=36',
            text: 'This brought tears to my eyes! So emotional ❤️',
            likes: 923,
            replies: 14,
        },
    ];

    const handleReplyComment = async (username: string) => {
        console.log('Reply to comment');
        setReplyTo(username);
        setCommentText(`@${username} `);
        // focus input để gõ tiếp
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleLikeComment = async () => {
        setIsLiked(!isLiked);
        console.log('Like comment');
    }

    const clearReply = () => {
        setReplyTo(null);
        setCommentText('');
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
                        <div className="flex-1 overflow-y-auto px-4 py-2">
                            {comments?.length > 0 ? (
                                comments.map((c: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 py-3">
                                        <img
                                            src={c?.User?.avatar || `https://i.pravatar.cc/150?img=${idx + 10}`}
                                            alt={c?.User?.userName || 'User avatar'}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <span className="font-semibold text-sm">{c?.User?.userName}</span>
                                                    <span className="ml-[5px] text-gray-500 text-xs">{DataUtil.formatCommentTime(c?.createdAt)}</span>
                                                    <p className="text-sm mt-1">{c?.content}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                        <span>{c.likes || 0} likes</span>
                                                        <button
                                                            onClick={() => handleReplyComment(c?.User?.userName)}
                                                            className="font-semibold"
                                                        >
                                                            Reply
                                                        </button>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleLikeComment()} className="p-1">
                                                    <Heart
                                                        className={`w-4 h-4 ${isLiked ? 'text-[#fc323e]' : 'text-black'}`}
                                                        fill={isLiked ? '#fc323e' : 'none'}
                                                    />
                                                </button>
                                            </div>

                                            {c.replies > 0 && (
                                                <button className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <div className="w-6 h-px bg-gray-300" />
                                                    <span>View all {c.replies} replies</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
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
                                        onClick={() => {
                                            console.log('Post comment:', commentText);
                                            setCommentText('');
                                        }}
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
