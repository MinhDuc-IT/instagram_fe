// 'use client';
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Settings, MoreHorizontal, Loader } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { toggleFollowInPost } from '../redux/features/post/postSlice';
// import { toggleFollow } from '../redux/features/user/userSlice';

// import { FollowService } from '../service/followService';
// import { User as AuthUser } from '../redux/features/auth/authSlice';
// import { User as ProfileUser } from '../types/user.type';

// interface ProfileHeaderProps {
//     profileUser: ProfileUser | null;
//     currentUser: AuthUser | null;
//     isOwnProfile: boolean;
//     onEditProfile: () => void;
// }

// export default function ProfileHeader({ profileUser, currentUser, isOwnProfile, onEditProfile }: ProfileHeaderProps) {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [isFollowing, setIsFollowing] = useState(profileUser?.isFollowing || false);
//     const [followersCount, setFollowersCount] = useState(profileUser?.followers ?? 0);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         setIsFollowing(profileUser?.isFollowing || false);
//         setFollowersCount(profileUser?.followers ?? 0);
//     }, [profileUser?.id, profileUser?.isFollowing, profileUser?.followers]);

//     if (!profileUser) return null;
//     console.log('Rendering ProfileHeader for user:', profileUser);

//     const handleFollow = async (userId: number) => {
//         if (loading) return;

//         const nextFollowing = !isFollowing;
//         const prevFollowing = isFollowing;
//         const prevFollowers = followersCount;

//         // Optimistic update - local state
//         setIsFollowing(nextFollowing);
//         setFollowersCount((c) => Math.max(0, c + (nextFollowing ? 1 : -1)));

//         // Optimistic update - Redux state
//         // Update posts in home feed
//         dispatch(toggleFollowInPost(userId));
//         // Update user in users list (for profile)
//         dispatch(toggleFollow(userId));

//         try {
//             setLoading(true);
//             await FollowService.followUser(userId);
//             console.log(`${nextFollowing ? 'Followed' : 'Unfollowed'} user with ID:`, userId);
//         } catch (error) {
//             console.error('Failed to follow user:', error);
//             // Rollback local state
//             setIsFollowing(prevFollowing);
//             setFollowersCount(prevFollowers);
//             // Rollback Redux state
//             dispatch(toggleFollowInPost(userId));
//             dispatch(toggleFollow(userId));
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleMessage = (userId: number) => {
//         // Chỉ navigate đến messages page với userId, không tạo conversation
//         // Conversation sẽ được tạo tự động khi gửi tin nhắn đầu tiên
//         navigate(`/messages?userId=${userId}`);
//     };
//     return (
//         <div className="px-4 md:px-12 py-8 max-w-5xl mx-auto">
//             <div className="flex flex-col md:flex-row gap-8 md:gap-12">
//                 {/* Avatar */}
//                 <div className="flex justify-center md:justify-start md:w-1/3">
//                     <div className="relative group cursor-pointer">
//                         <img
//                             src={profileUser.avatar || '/placeholder.svg'}
//                             alt={profileUser.username}
//                             className="w-[77px] h-[77px] md:w-[150px] md:h-[150px] rounded-full object-cover border border-gray-200 dark:border-gray-800 p-[2px] bg-white dark:bg-black"
//                         />
//                     </div>
//                 </div>

//                 {/* Info */}
//                 <div className="flex-1 space-y-6">
//                     <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5">
//                         <h1 className="text-[20px] font-normal leading-6">{profileUser.username}</h1>

//                         {isOwnProfile ? (
//                             <div className="flex items-center gap-2">
//                                 <button
//                                     onClick={onEditProfile}
//                                     className="btn-secondary h-[32px] flex items-center"
//                                 >
//                                     Edit profile
//                                 </button>
//                                 <button className="p-2 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-full transition-colors">
//                                     <Settings className="w-6 h-6" />
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="flex items-center gap-2">
//                                 <button
//                                     onClick={() => handleFollow(profileUser.id)}
//                                     className={`${isFollowing
//                                         ? 'bg-[#efefef] hover:bg-[#dbdbdb] dark:bg-[#363636] dark:hover:bg-[#262626] text-black dark:text-white'
//                                         : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'} 
//                                         h-[32px] px-4 rounded-lg text-sm font-semibold transition-colors min-w-[100px] flex items-center justify-center`}
//                                     disabled={loading}
//                                 >
//                                     {loading ? (
//                                         <Loader className="animate-spin w-4 h-4" />
//                                     ) : isFollowing ? (
//                                         'Following'
//                                     ) : (
//                                         'Follow'
//                                     )}
//                                 </button>
//                                 <button
//                                     onClick={() => handleMessage(profileUser.id)}
//                                     className="btn-secondary h-[32px] flex items-center"
//                                 >
//                                     Message
//                                 </button>
//                                 <button className="btn-secondary h-[32px] w-[32px] flex items-center justify-center p-0">
//                                     <MoreHorizontal className="w-5 h-5" />
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     {/* Stats - Hidden on mobile, shown on desktop */}
//                     <div className="hidden md:flex gap-10">
//                         <div>
//                             <span className="font-semibold text-[16px]">{profileUser.posts ?? 0}</span>
//                             <span className="ml-1 text-[16px]">posts</span>
//                         </div>

//                         <div>
//                             <span className="font-semibold text-[16px]">{followersCount.toLocaleString()}</span>
//                             <span className="ml-1 text-[16px]">followers</span>
//                         </div>

//                         <div>
//                             <span className="font-semibold text-[16px]">{(profileUser.following ?? 0).toLocaleString()}</span>
//                             <span className="ml-1 text-[16px]">following</span>
//                         </div>
//                     </div>

//                     {/* Bio */}
//                     <div className="text-[14px]">
//                         <p className="font-semibold mb-1">{profileUser.fullName ?? ''}</p>
//                         <p className="whitespace-pre-line text-gray-900 dark:text-gray-100">{profileUser.bio ?? ''}</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Mobile Stats - Shown only on mobile */}
//             <div className="flex md:hidden border-t dark:border-gray-800 mt-8 py-3 w-full justify-around">
//                 <div className="flex flex-col items-center">
//                     <span className="font-semibold">{profileUser.posts ?? 0}</span>
//                     <span className="text-gray-500 text-[12px]">posts</span>
//                 </div>
//                 <div className="flex flex-col items-center">
//                     <span className="font-semibold">{followersCount.toLocaleString()}</span>
//                     <span className="text-gray-500 text-[12px]">followers</span>
//                 </div>
//                 <div className="flex flex-col items-center">
//                     <span className="font-semibold">{(profileUser.following ?? 0).toLocaleString()}</span>
//                     <span className="text-gray-500 text-[12px]">following</span>
//                 </div>
//             </div>
//         </div>
//     );
// }

'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, MoreHorizontal, Loader, MessageCircle } from 'lucide-react';
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
        dispatch(toggleFollowInPost(userId));
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
        navigate(`/messages?userId=${userId}`);
    };

    return (
        <div className="px-4 md:px-12 py-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                {/* Avatar */}
                <div className="flex justify-center md:justify-start md:w-1/3">
                    <div className="relative">
                        <img
                            src={profileUser.avatar || '/placeholder.svg'}
                            alt={profileUser.username}
                            className="w-[90px] h-[90px] md:w-[160px] md:h-[160px] rounded-full object-cover border-4 border-white dark:border-[#262626] shadow-xl"
                        />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-7">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                        <h1 className="text-[22px] md:text-[24px] font-light tracking-tight">{profileUser.username}</h1>

                        {isOwnProfile ? (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={onEditProfile}
                                    className="flex-1 md:flex-none bg-[#efefef] hover:bg-[#dbdbdb] dark:bg-[#363636] dark:hover:bg-[#262626] text-black dark:text-white h-[34px] px-5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    Edit profile
                                </button>
                                <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-[#363636] rounded-lg transition-all duration-200 hover:scale-110 active:scale-95">
                                    <Settings className="w-6 h-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleFollow(profileUser.id)}
                                    className={`${isFollowing
                                        ? 'bg-[#efefef] hover:bg-[#dbdbdb] dark:bg-[#363636] dark:hover:bg-[#262626] text-black dark:text-white'
                                        : 'bg-gradient-to-r from-[#0095f6] to-[#00a8ff] hover:from-[#1877f2] hover:to-[#0095f6] text-white shadow-lg shadow-blue-500/30'} 
                                        h-[34px] px-6 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[110px] flex items-center justify-center hover:scale-105 active:scale-95`}
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
                                <button
                                    onClick={() => handleMessage(profileUser.id)}
                                    className="flex-1 md:flex-none bg-[#efefef] hover:bg-[#dbdbdb] dark:bg-[#363636] dark:hover:bg-[#262626] text-black dark:text-white h-[34px] px-5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Message</span>
                                </button>
                                <button className="bg-[#efefef] hover:bg-[#dbdbdb] dark:bg-[#363636] dark:hover:bg-[#262626] text-black dark:text-white h-[34px] w-[34px] rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats - Hidden on mobile, shown on desktop */}
                    <div className="hidden md:flex gap-12">
                        <div className="flex items-baseline gap-1.5 group cursor-pointer">
                            <span className="font-semibold text-[17px] group-hover:scale-110 transition-transform duration-200">{profileUser.posts ?? 0}</span>
                            <span className="text-[15px] text-gray-600 dark:text-gray-400">posts</span>
                        </div>

                        <div className="flex items-baseline gap-1.5 group cursor-pointer">
                            <span className="font-semibold text-[17px] group-hover:scale-110 transition-transform duration-200">{followersCount.toLocaleString()}</span>
                            <span className="text-[15px] text-gray-600 dark:text-gray-400">followers</span>
                        </div>

                        <div className="flex items-baseline gap-1.5 group cursor-pointer">
                            <span className="font-semibold text-[17px] group-hover:scale-110 transition-transform duration-200">{(profileUser.following ?? 0).toLocaleString()}</span>
                            <span className="text-[15px] text-gray-600 dark:text-gray-400">following</span>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="text-[14px] md:text-[15px] space-y-2">
                        {profileUser.fullName && (
                            <p className="font-semibold text-[15px] md:text-[16px]">{profileUser.fullName}</p>
                        )}
                        {profileUser.bio && (
                            <p className="whitespace-pre-line text-gray-900 dark:text-gray-100 leading-relaxed">
                                {profileUser.bio}
                            </p>
                        )}
                        {profileUser.website && (
                            <a
                                href={profileUser.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00376b] dark:text-[#e0f1ff] hover:underline font-medium inline-flex items-center gap-1"
                            >
                                {profileUser.website}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Stats - Shown only on mobile */}
            <div className="flex md:hidden border-t dark:border-[#363636] mt-8 pt-4 w-full justify-around">
                <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-[16px]">{profileUser.posts ?? 0}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-[13px]">posts</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-[16px]">{followersCount.toLocaleString()}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-[13px]">followers</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-[16px]">{(profileUser.following ?? 0).toLocaleString()}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-[13px]">following</span>
                </div>
            </div>
        </div>
    );
}