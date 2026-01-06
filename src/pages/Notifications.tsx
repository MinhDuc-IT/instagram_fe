import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import {
    fetchNotificationsRequest,
    markAsReadRequest,
    markAllAsReadRequest,
    loadMoreNotificationsRequest,
} from '../redux/features/notification/notificationSlice';
import { DataUtil } from '../utils/DataUtil';
import { PostService } from '../service/postService';
import { Post } from '../types/post.type';
import PostModal from '../components/PostModal';
import { toast } from 'react-toastify';

export default function Notifications() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notifications, loading, unreadCount, hasMore, loadingMore } = useSelector(
        (state: RootState) => state.notification,
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [scrollToCommentId, setScrollToCommentId] = useState<number | null>(null);

    useEffect(() => {
        // Fetch notifications khi component mount
        dispatch(fetchNotificationsRequest());
    }, [dispatch]);

    // Infinite scroll: Load more khi scroll đến cuối
    useEffect(() => {
        if (!hasMore || loadingMore) {
            return;
        }

        // Tạo Intersection Observer để detect khi scroll đến cuối
        const options = {
            root: null,
            rootMargin: '100px', // Load more khi còn cách 100px đến cuối
            threshold: 0.1,
        };

        observerRef.current = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !loadingMore) {
                dispatch(loadMoreNotificationsRequest());
            }
        }, options);

        if (loadMoreTriggerRef.current) {
            observerRef.current.observe(loadMoreTriggerRef.current);
        }

        return () => {
            if (observerRef.current && loadMoreTriggerRef.current) {
                observerRef.current.unobserve(loadMoreTriggerRef.current);
            }
        };
    }, [hasMore, loadingMore, dispatch]);

    const handleMarkAsRead = (notificationId: number) => {
        dispatch(markAsReadRequest(notificationId));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsReadRequest());
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            dispatch(loadMoreNotificationsRequest());
        }
    };

    const handleNotificationClick = async (notification: any) => {
        console.log('🔔 Notification clicked:', notification);
        console.log('🔔 Notification postId:', notification.postId);
        console.log('🔔 Notification commentId:', notification.commentId);
        console.log('🔔 Notification type:', notification.type);

        // Đánh dấu đã đọc nếu chưa đọc
        if (!notification.isRead) {
            dispatch(markAsReadRequest(notification.id));
        }

        // Nếu là notification follow, chuyển đến profile của người gửi
        if (notification.type === 'follow' && notification.senderId) {
            navigate(`/profile/${notification.senderId}`);
            return;
        }

        // Nếu có postId, mở PostModal
        if (notification.postId) {
            try {
                console.log('📝 Fetching post with ID:', notification.postId);
                const res = await PostService.getById(notification.postId);
                console.log('📝 Post response:', res);
                console.log('📝 Post response type:', typeof res);
                console.log('📝 Post response is null/undefined:', res === null || res === undefined);

                if (res === null || res === undefined) {
                    console.error('❌ Post response is null/undefined');
                    toast.error('Không thể tải bài viết. Vui lòng thử lại.');
                    return;
                }

                // axios interceptor trả về response.data, nên res đã là data object
                // Kiểm tra nhiều trường hợp để đảm bảo lấy đúng data
                let post = null;
                if (res) {
                    // Nếu res có data property (nested response)
                    if (res.data && typeof res.data === 'object' && res.data.id) {
                        post = res.data;
                    }
                    // Nếu res chính là post object
                    else if (res.id) {
                        post = res;
                    }
                    // Nếu res có nested structure khác
                    else if (res.data) {
                        post = res.data;
                    }
                }

                console.log('📝 Post data after processing:', post);

                if (post && post.id) {
                    setSelectedPost(post);
                    // Nếu có commentId, set để scroll đến comment đó
                    if (notification.commentId) {
                        setScrollToCommentId(notification.commentId);
                    } else {
                        setScrollToCommentId(null);
                    }
                } else {
                    console.error('❌ Invalid post data:', post);
                    console.error('❌ Post response structure:', JSON.stringify(res, null, 2));
                    toast.error('Không thể tải bài viết. Dữ liệu không hợp lệ.');
                }
            } catch (error: any) {
                console.error('❌ Error fetching post:', error);
                console.error('❌ Error response:', error?.response);
                console.error('❌ Error message:', error?.message);
                console.error('❌ Error stack:', error?.stack);
                toast.error(
                    error?.response?.data?.message || error?.message || 'Không thể tải bài viết. Vui lòng thử lại.',
                );
            }
        } else {
            console.log('⚠️ Notification does not have postId');
            toast.info('Thông báo này không liên kết với bài viết cụ thể.');
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const formatted = DataUtil.formatCommentTime(dateString);
            // Thêm "trước" để rõ nghĩa hơn
            if (formatted === 'now') {
                return 'Vừa xong';
            }
            return `${formatted} trước`;
        } catch {
            return 'Vừa xong';
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4 px-4" ref={containerRef}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Thông báo</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>

            {loading && notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa có thông báo nào</div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                                notification.isRead
                                    ? 'hover:bg-gray-50 dark:hover:bg-gray-900'
                                    : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <img
                                src={notification.sender?.avatar || '/placeholder.svg'}
                                alt={notification.sender?.userName || 'User'}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-semibold">
                                        {notification.sender?.fullName || notification.sender?.userName || 'Người dùng'}
                                    </span>{' '}
                                    {notification.content}
                                </p>
                                <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                            </div>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                    ))}

                    {/* Trigger element cho infinite scroll */}
                    {hasMore && (
                        <div ref={loadMoreTriggerRef} className="text-center py-4">
                            {loadingMore ? (
                                <div className="text-sm text-gray-500">Đang tải thêm...</div>
                            ) : (
                                <button
                                    onClick={handleLoadMore}
                                    className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Tải thêm
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Post Modal */}
            {selectedPost && (
                <PostModal
                    post={selectedPost}
                    onClose={() => {
                        setSelectedPost(null);
                        setScrollToCommentId(null);
                    }}
                    scrollToCommentId={scrollToCommentId}
                />
            )}
        </div>
    );
}
