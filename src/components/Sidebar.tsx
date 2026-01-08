'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Clapperboard, Film, MessageCircle, Heart, PlusSquare, LogOut, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest } from '../redux/features/auth/authSlice';
import { fetchUsersRequest } from '../redux/features/user/userSlice';
import ThemeToggle from './ThemeToggle';
import CreatePostModal from './CreatePost';
import SearchSidebar from './SearchSidebar';
import type { RootState, AppDispatch } from '../redux/store';

interface NavItem {
    path?: string;
    icon: React.ComponentType<{ className?: string; fill?: string }>;
    label: string;
    onClick?: () => void;
}

export default function Sidebar() {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const navigate = useNavigate();

    const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

    const { unreadCount } = useSelector((state: RootState) => state.notification);

    const { totalUnreadMessages } = useSelector((state: RootState) => state.message);

    const { users } = useSelector((state: RootState) => state.users);

    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [openPostModal, setOpenPostModal] = useState<boolean>(false);
    const [showSearchSidebar, setShowSearchSidebar] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    // Fetch users khi component mount để có data search
    useEffect(() => {
        if (isAuthenticated && users.length === 0) {
            dispatch(fetchUsersRequest());
        }
    }, [isAuthenticated, dispatch, users.length]);

    const navItems: NavItem[] = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/explore', icon: Compass, label: 'Explore' },
        { path: '/reels', icon: Film, label: 'Reels' },
        { path: '/messages', icon: MessageCircle, label: 'Messages' },
        { icon: Search, label: 'Search', onClick: () => setShowSearchSidebar(true) },
        { path: '/notifications', icon: Heart, label: 'Notifications' },
    ];

    const isActive = (path?: string) => path && location.pathname === path;

    const handleLogout = () => {
        dispatch(logoutRequest());
    };

    return (
        <>
            <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black z-50 p-4">
                <div className="mb-8 px-3 py-4">
                    <h1 className="text-2xl font-bold">Instagram</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map(({ path, icon: Icon, label, onClick }) => {
                        const showNotificationBadge = path === '/notifications' && unreadCount > 0;
                        const showMessageBadge = path === '/messages' && totalUnreadMessages > 0;
                        const showBadge = showNotificationBadge || showMessageBadge;
                        const active = isActive(path);

                        const content = (
                            <>
                                <div className="relative">
                                    <Icon className="w-6 h-6" fill={active ? 'currentColor' : 'none'} />
                                    {showBadge && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
                                    )}
                                </div>
                                <span>{label}</span>
                            </>
                        );

                        if (onClick) {
                            return (
                                <button
                                    key={label}
                                    onClick={onClick}
                                    className={`relative flex items-center gap-4 px-3 py-3 rounded-lg transition-colors w-full text-left ${
                                        showSearchSidebar ? 'font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                                    }`}
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={path}
                                to={path!}
                                className={`relative flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                                    active ? 'font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                                }`}
                            >
                                {content}
                            </Link>
                        );
                    })}

                    {/* <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors w-full"
          >
            <PlusSquare className="w-6 h-6" />
            <span>Create</span>
          </button> */}

                    <button
                        onClick={() => setOpenPostModal(true)}
                        className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors w-full"
                    >
                        <PlusSquare className="w-6 h-6" />
                        <span>Create</span>
                    </button>

                    <Link
                        to={`/profile/${user?.id ?? ''}`}
                        className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                            location.pathname.includes('/profile')
                                ? 'font-bold'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                        }`}
                    >
                        <img
                            src={user?.avatar || '/placeholder.svg'}
                            alt={user?.username || 'avatar'}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>Profile</span>
                    </Link>
                </nav>

                <div className="space-y-2 border-t border-gray-200 dark:border-gray-800 pt-4">
                    <div className="flex items-center gap-4 px-3 py-3">
                        <ThemeToggle />
                        <span>Theme</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors w-full"
                    >
                        <LogOut className="w-6 h-6" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* {showCreateModal && <ModalCreatePost onClose={() => setShowCreateModal(false)} />} */}

            <CreatePostModal open={openPostModal} onClose={() => setOpenPostModal(false)} />

            {/* Search Sidebar */}
            <SearchSidebar isOpen={showSearchSidebar} onClose={() => setShowSearchSidebar(false)} />
        </>
    );
}
