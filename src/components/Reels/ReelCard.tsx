import { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Play, X, Smile } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

import { likePostRequest } from '../../redux/features/reels/reelsSlice';
import { RootState } from '@/src/redux/store';
import { PostService } from '../../service/postService';
import { DataUtil } from '../../utils/DataUtil';
import Comment from '../Reels/Comment';
import 'tippy.js/dist/tippy.css';

export default function ReelCard({
    reel,
    videoRef,
    globalMuted,
    setGlobalMuted,
    onTogglePlay,
    showPlayIcon,
    showPauseIcon,
}: any) {
    const [isLiked, setIsLiked] = useState(reel.isLiked);
    const [isSaved, setIsSaved] = useState(reel.isSaved);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const avatarUrl = useSelector((state: RootState) => state?.auth?.user?.avatar);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('Reel ID changed:', reel.id);
        setShowComments(false);
    }, [reel.id]);
    console.log('Reel ID changed:', reel.id);

    const handleLike = async (reel: any) => {
        await PostService.like(reel.id);
        reel.likesCount = isLiked ? reel.likesCount - 1 : reel.likesCount + 1;
        reel.isLiked = !reel.isLiked;
        setIsLiked((prev: boolean) => !prev);
    };

    const handleClickComment = (reel: any) => {
        setShowComments((prev) => !prev);
    };

    const handleClickFollow = () => {
        console.log('Follow button clicked for user:', reel.username);
    };

    const handleWheel = (e: React.WheelEvent) => {
        const target = e.target as HTMLElement;
        const isScrollingInComment = target.closest('.comment-popup');
        if (showComments && !isScrollingInComment) {
            setShowComments(false);
        }
    };

    const handleSave = async () => {
        await PostService.save(reel.id);
        reel.isSaved = !reel.isSaved;
        setIsSaved((prev: boolean) => !prev);
    };

    return (
        <div
            onWheel={handleWheel}
            className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-white"
        >
            <div className="relative w-full max-w-[420px] h-[calc(100vh-2rem)] flex items-center justify-center mx-auto rounded-lg">
                <video
                    ref={videoRef}
                    src={reel?.video?.secureUrl || reel?.video?.url || ''}
                    loop
                    playsInline
                    className="object-contain w-full h-full rounded-lg"
                />

                {/* Overlay */}
                {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"> */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50">
                    {/* Top */}
                    <div className="absolute z-10 top-4 left-4 right-4 flex items-center justify-between">
                        <span className="text-white font-semibold"></span>
                        <button
                            onClick={() => setGlobalMuted((s: boolean) => !s)}
                            className="flex flex-col items-center"
                        >
                            {globalMuted ? (
                                <VolumeX className="w-7 h-7 text-white" />
                            ) : (
                                <Volume2 className="w-7 h-7 text-white" />
                            )}
                        </button>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute z-10 bottom-20 left-4 right-20">
                        <div className="flex items-center gap-2 mb-3">
                            <img
                                src={reel?.User?.avatar || '/placeholder.svg'}
                                alt={reel?.User?.userName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-white font-semibold">{reel?.User?.userName || 'No-Name'}</span>
                            <button
                                onClick={() => handleClickFollow()}
                                className="text-white border border-white rounded-[6px] px-3 py-1 text-sm font-semibold"
                            >
                                Follow
                            </button>
                        </div>
                        <p className="text-white text-sm">{reel?.caption}</p>
                    </div>

                    {/* Right Actions */}
                    <div className="absolute bottom-12 right-[-60px] flex flex-col gap-6">
                        <button
                            // onClick={() => dispatch(likePostRequest(reel.id))}
                            onClick={() => handleLike(reel)}
                            className="flex flex-col items-center"
                        >
                            <Heart
                                className={`w-7 h-7 ${isLiked ? 'text-[#fc323e]' : 'text-black'}`}
                                fill={isLiked ? '#fc323e' : 'none'}
                            />
                            <span className="text-black text-xs mt-1">
                                {DataUtil.formatlikeCount(reel?.likesCount || 0)}
                            </span>
                        </button>
                        <Comment
                            reel={reel}
                            showComments={showComments}
                            setShowComments={setShowComments}
                            avatarUrl={avatarUrl}
                            commentText={commentText}
                            setCommentText={setCommentText}
                            handleClickComment={handleClickComment}
                        />
                        {/* <Tippy
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
                                    className="bg-white rounded-2xl shadow-2xl w-[350px] max-w-[calc(100vw-32px)] h-[400px] max-h-[calc(100vh-32px)] flex flex-col animate-scaleIn"
                                    tabIndex={-1}
                                    {...attrs}
                                >
                                    
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

                                    <div className="flex-1 overflow-y-auto px-4 py-2">
                                        {fakeComments?.length > 0 ? (
                                            fakeComments.map((c: any, idx: number) => (
                                                <div key={idx} className="flex gap-3 py-3">
                                                    <img
                                                        src={
                                                            c.userAvatar || `https://i.pravatar.cc/150?img=${idx + 10}`
                                                        }
                                                        alt={c.username}
                                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <span className="font-semibold text-sm">
                                                                    {c.username}
                                                                </span>
                                                                <span className="ml-[5px] text-gray-500 text-xs">
                                                                    2h
                                                                </span>
                                                                <p className="text-sm mt-1">{c.text}</p>
                                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                    <span>{c.likes || 0} likes</span>
                                                                    <button className="font-semibold">Reply</button>
                                                                </div>
                                                            </div>
                                                            <button className="p-1">
                                                                <Heart className="w-4 h-4" />
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
                                <span className="text-black text-xs mt-1">
                                    {reel?.commentsCount?.toLocaleString?.() || 0}
                                </span>
                            </button>
                        </Tippy> */}
                        <button className="flex flex-col items-center">
                            <Send className="w-7 h-7 text-black" />
                        </button>
                        <button onClick={() => handleSave()} className="flex flex-col items-center">
                            <Bookmark className="w-7 h-7 text-black" fill={isSaved ? 'black' : 'none'} />
                        </button>
                        <button className="text-black p-2">
                            <MoreHorizontal className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <button onClick={onTogglePlay} className="absolute inset-0" />
                <div
                    className={`
                        absolute inset-0 flex items-center justify-center pointer-events-none
                        transition-opacity duration-300
                        ${showPlayIcon ? 'animate-fadeScaleOut' : 'opacity-0'}
                    `}
                >
                    <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center">
                        <Play className="w-14 h-14 text-white" />
                    </div>
                </div>

                {showPauseIcon && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center">
                            <Play className="w-14 h-14 text-white" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
