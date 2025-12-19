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

        const socket = getSocket(); // ✅ Gọi getSocket() trực tiếp

        if (!socket || !socket.connected) {
            console.warn('Socket not connected');
            return;
        }

        socketRef.current = socket;

        // Join post room
        socket.emit('join_post', { postId });
        console.log('📌 Joined post room:', postId);

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

        // ✅ Cleanup: bỏ lắng nghe + rời room
        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_post', { postId });
                socketRef.current.off('comment_added', listenersRef.current.added);
                socketRef.current.off('comment_deleted', listenersRef.current.deleted);
                console.log('📌 Left post room:', postId);
            }
        };
    }, [postId, showComments, onCommentAdded, onCommentDeleted]);
};
