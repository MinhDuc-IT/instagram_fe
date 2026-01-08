import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './redux/store';
import { useNotifications } from './hooks/useNotifications';
import { fetchConversationsRequest } from './redux/features/message/messageSlice';
import { fetchNotificationsRequest } from './redux/features/notification/notificationSlice';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Reels from './pages/Reels';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ProtectedRoute from './ProtectedRoute';
import SocialLogin from './pages/SocialLogin';

export default function AppContent() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const theme = useSelector((state: RootState) => state.theme.theme);

    // Sync theme to DOM
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Khởi tạo socket connection cho notifications
    useNotifications();

    // Fetch conversations và notifications ngay khi authenticated để hiển thị badge
    useEffect(() => {
        if (isAuthenticated) {
            // Fetch conversations để tính totalUnreadMessages (hiển thị badge Messages)
            dispatch(fetchConversationsRequest());
            // Fetch notifications để có unreadCount (hiển thị badge Notifications)
            dispatch(fetchNotificationsRequest());
        }
    }, [isAuthenticated, dispatch]);

    return (
        <BrowserRouter>
            {isAuthenticated && (
                <>
                    <Sidebar />
                    <Navbar />
                </>
            )}
            <main className={isAuthenticated ? 'md:ml-64 pb-14 md:pb-0' : ''}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/code/:userId/:tokenLogin" element={<SocialLogin />} />

                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/explore"
                        element={
                            <ProtectedRoute>
                                <Explore />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reels"
                        element={
                            <ProtectedRoute>
                                <Reels />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/messages"
                        element={
                            <ProtectedRoute>
                                <Messages />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/:userId"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/home" />} />
                </Routes>
            </main>
            <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
    );
}
