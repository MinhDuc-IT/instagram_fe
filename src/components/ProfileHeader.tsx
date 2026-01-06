'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, MoreHorizontal, Loader } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toggleFollowInPost } from '../redux/features/post/postSlice';
import { toggleFollow } from '../redux/features/user/userSlice';

import { FollowService } from '../service/followService';
import { User as AuthUser } from '../redux/features/auth/authSlice';
import { User as ProfileUser } from '../types/user.type';

interface ProfileHeaderProps {
    profileUser: ProfileUser | null;
    currentUser: AuthUser | null;
    isOwnProfile: boolean;
    onEditProfile: () => void;
}

export default function ProfileHeader({ profileUser, currentUser, isOwnProfile, onEditProfile }: ProfileHeaderProps) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isFollowing, setIsFollowing] = useState(profileUser?.isFollowing || false);
    const [followersCount, setFollowersCount] = useState(profileUser?.followers ?? 0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsFollowing(profileUser?.isFollowing || false);
        setFollowersCount(profileUser?.followers ?? 0);
    }, [profileUser?.id, profileUser?.isFollowing, profileUser?.followers]);

    if (!profileUser) return null;
    console.log('Rendering ProfileHeader for user:', profileUser);

    const handleFollow = async (userId: number) => {
        if (loading) return;

        const nextFollowing = !isFollowing;
        const prevFollowing = isFollowing;
        const prevFollowers = followersCount;

        // Optimistic update - local state
        setIsFollowing(nextFollowing);
        setFollowersCount((c) => Math.max(0, c + (nextFollowing ? 1 : -1)));

        // Optimistic update - Redux state
        // Update posts in home feed
        dispatch(toggleFollowInPost(userId));
        // Update user in users list (for profile)
        dispatch(toggleFollow(userId));

        try {
            setLoading(true);
            await FollowService.followUser(userId);
            console.log(`${nextFollowing ? 'Followed' : 'Unfollowed'} user with ID:`, userId);
        } catch (error) {
            console.error('Failed to follow user:', error);
            // Rollback local state
            setIsFollowing(prevFollowing);
            setFollowersCount(prevFollowers);
            // Rollback Redux state
            dispatch(toggleFollowInPost(userId));
            dispatch(toggleFollow(userId));
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = (userId: number) => {
        // Chỉ navigate đến messages page với userId, không tạo conversation
        // Conversation sẽ được tạo tự động khi gửi tin nhắn đầu tiên
        navigate(`/messages?userId=${userId}`);
    };
    return (
        <div className="px-4 md:px-12 py-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex justify-center md:justify-start">
                    <img
                        src={profileUser.avatar || '/placeholder.svg'}
                        alt={profileUser.username}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <h1 className="text-xl md:text-2xl font-normal">{profileUser.username}</h1>

                        {isOwnProfile ? (
                            <div className="flex gap-2">
                                <button onClick={onEditProfile} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
                                    Edit profile
                                </button>
                                {/* <button className="btn-secondary">
                                    <Settings className="w-5 h-5" />
                                </button> */}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleFollow(profileUser.id)}
                                    className={`${isFollowing
                                        ? 'bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'} 
                                        px-6 py-1.5 rounded-lg text-sm font-semibold transition-colors min-w-[100px] flex items-center justify-center`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader className="animate-spin w-4 h-4" />
                                    ) : isFollowing ? (
                                        'Following'
                                    ) : (
                                        'Follow'
                                    )}
                                </button>
                                <button onClick={() => handleMessage(profileUser.id)} className="btn-secondary">
                                    Message
                                </button>
                                <button className="btn-secondary">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                                {/* <button className="btn-secondary">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button> */}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 justify-center md:justify-start">
                        <div className="text-center md:text-left">
                            <span className="font-semibold">{profileUser.posts ?? 0}</span>
                            <span className="text-gray-500 ml-1">posts</span>
                        </div>

                        <div className="text-center md:text-left">
                            <span className="font-semibold">{followersCount.toLocaleString()}</span>
                            <span className="text-gray-500 ml-1">followers</span>
                        </div>

                        <div className="text-center md:text-left">
                            <span className="font-semibold">{(profileUser.following ?? 0).toLocaleString()}</span>
                            <span className="text-gray-500 ml-1">following</span>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <p className="font-semibold">{profileUser.fullName ?? ''}</p>
                        <p className="text-sm whitespace-pre-line">{profileUser.bio ?? ''}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
