import { useEffect } from 'react';
import { getSocket } from '../utils/socket';
import { useSocket } from './useSocket';

export const usePostComments = (
    postId: string,
    showComments: boolean,
    onCommentAdded?: (comment: any) => void,
    onCommentDeleted?: (commentId: string) => void,
) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!postId || !showComments || !isConnected || !socket) return;

        // const socket = getSocket();
        if (!socket) {
            console.warn('Socket not connected');
            return;
        }
        // console.log('Socket connected:', socket.connected);
        // Join room chỉ khi showComments = true
        socket.emit('join_post', { postId });
        // console.log('Joined post room:', postId);

        // Lắng nghe comment mới
        const handleCommentAdded = (data: any) => {
            if (data.postId === postId) {
                console.log('📝 New comment received:', data.comment);
                onCommentAdded?.(data.comment);
            }
        };

        // Lắng nghe comment bị xóa
        const handleCommentDeleted = (data: any) => {
            if (data.postId === postId) {
                console.log('🗑️ Comment deleted:', data.commentId);
                onCommentDeleted?.(data.commentId);
            }
        };

        socket.on('comment_added', handleCommentAdded);
        socket.on('comment_deleted', handleCommentDeleted);

        return () => {
            // Leave room khi đóng comment (showComments = false)
            socket.emit('leave_post', { postId });
            socket.off('comment_added', handleCommentAdded);
            socket.off('comment_deleted', handleCommentDeleted);
        };
    }, [postId, showComments, isConnected, socket, onCommentAdded, onCommentDeleted]);
};
