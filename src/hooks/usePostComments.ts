import { useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';

export const usePostComments = (
    postId: string,
    showComments: boolean,
    onCommentAdded?: (comment: any) => void,
    onCommentDeleted?: (commentId: string) => void,
) => {
    const socketRef = useRef<any>(null);
    const listenersRef = useRef<{ added?: any; deleted?: any }>({});

    useEffect(() => {
        if (!postId || !showComments) return;

        const socket = getSocket(); // ✅ Dùng chung socket /messages

        if (!socket) {
            console.warn('Socket not initialized');
            return;
        }

        socketRef.current = socket;

        // ✅ Hàm join room - gọi ngay nếu đã connected hoặc đợi event 'connect'
        const joinRoom = () => {
            if (socket.connected) {
                console.log('📤 Emitting join_post for:', postId);
                socket.emit('join_post', { postId }, (response: any) => {
                    if (response?.success) {
                        console.log('✅ Successfully joined post room:', postId);
                    } else {
                        console.error('❌ Failed to join post room:', response);
                    }
                });
            } else {
                console.warn('⚠️ Cannot join room, socket not connected');
            }
        };

        // ✅ Định nghĩa listeners
        const handleCommentAdded = (data: any) => {
            if (data.postId === postId) {
                console.log('📝 New comment received:', data.comment);
                onCommentAdded?.(data.comment);
            }
        };

        const handleCommentDeleted = (data: any) => {
            if (data.postId === postId) {
                console.log('🗑️ Comment deleted:', data.commentId);
                onCommentDeleted?.(data.commentId);
            }
        };

        // ✅ Ghi danh lắng nghe
        socket.on('comment_added', handleCommentAdded);
        socket.on('comment_deleted', handleCommentDeleted);

        // ✅ Lưu listeners vào ref để cleanup sau
        listenersRef.current = { added: handleCommentAdded, deleted: handleCommentDeleted };

        // ✅ Join room: ngay lập tức nếu đã connected, hoặc đợi event connect
        if (socket.connected) {
            joinRoom();
        } else {
            socket.once('connect', joinRoom);
        }

        // ✅ Cleanup: bỏ lắng nghe + rời room
        return () => {
            if (socketRef.current && socketRef.current.connected) {
                console.log('📤 Emitting leave_post for:', postId);
                socketRef.current.emit('leave_post', { postId }, (response: any) => {
                    if (response?.success) {
                        console.log('✅ Successfully left post room:', postId);
                    }
                });
                socketRef.current.off('comment_added', listenersRef.current.added);
                socketRef.current.off('comment_deleted', listenersRef.current.deleted);
            }
        };
    }, [postId, showComments]);
};
