import { useEffect, useState } from 'react';
import { Heart, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Play } from 'lucide-react';
import { useSelector } from 'react-redux';

import { RootState } from '@/src/redux/store';
import { PostService } from '../../service/postService';
import { DataUtil } from '../../utils/DataUtil';
import Comment from '../Reels/Comment';
import { usePostComments } from '../../hooks/usePostComments';
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
    const avatarUrl = useSelector((state: RootState) => state?.auth?.user?.avatar);
    const [showFullCaption, setShowFullCaption] = useState(false)

    const captionLimit = 100
    const needsTruncate = (reel.caption?.length ?? 0) > captionLimit

    useEffect(() => {
        setShowComments(false);
    }, [reel.id]);

    const toggleCaption = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowFullCaption(!showFullCaption)
    }
    const handleLike = async (reel: any) => {
        await PostService.like(reel.id);
        reel.likesCount = isLiked ? reel.likesCount - 1 : reel.likesCount + 1;
        reel.isLiked = !reel.isLiked;
        setIsLiked((prev: boolean) => !prev);
    };

    usePostComments(reel.id, showComments);

    const handleClickComment = () => {
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
            className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-white dark:bg-black"
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
                        {/* <p className="text-white text-sm">{reel?.caption}</p> */}
                        {reel?.caption && (
                            <div className="text-sm">
                                {/* <span className="font-semibold mr-1 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 dark:text-white" onClick={handleProfileClick}>
                                    {reel?.username}
                                </span> */}
                                <span className="text-white dark:text-white">
                                    {needsTruncate && !showFullCaption
                                        ? reel?.caption.slice(0, captionLimit) + '...'
                                        : reel?.caption
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
                            </div>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="absolute bottom-12 right-[-60px] flex flex-col gap-6">
                        <button onClick={() => handleLike(reel)} className="flex flex-col items-center">
                            <Heart
                                className={`w-7 h-7 ${isLiked ? 'text-[#fc323e]' : 'text-black dark:text-white'}`}
                                fill={isLiked ? '#fc323e' : 'none'}
                            />
                            <span className="text-black dark:text-white text-xs mt-1">
                                {DataUtil.formatlikeCount(reel?.likesCount || 0)}
                            </span>
                        </button>
                        <Comment
                            key={reel.id}
                            reel={reel}
                            showComments={showComments}
                            setShowComments={setShowComments}
                            avatarUrl={avatarUrl}
                            handleClickComment={handleClickComment}
                        />
                        <button className="flex flex-col items-center">
                            <Send className="w-7 h-7 text-black dark:text-white" />
                        </button>
                        <button onClick={() => handleSave()} className="flex flex-col items-center">
                            <Bookmark className="w-7 h-7 text-black dark:text-white" fill={isSaved ? 'black' : 'none'} />
                        </button>
                        <button className="text-black dark:text-white p-2">
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
