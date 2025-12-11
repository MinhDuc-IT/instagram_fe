import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, disconnectSocket } from '../utils/socket';
import { addNewMessage, updateConversation } from '../redux/features/message/messageSlice';
import { Message, Conversation } from '../redux/features/message/messageSlice';

export const useSocket = () => {
    const dispatch = useDispatch();
    const { selectedConversationId } = useSelector((state: any) => state.message);
    const { isAuthenticated, accessToken, user } = useSelector((state: any) => state.auth);
    const socketRef = useRef<any>(null);
    const joinedRoomsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            return;
        }

        const socket = getSocket();
        if (!socket) {
            return;
        }

        socketRef.current = socket;

        // Listen for new messages
        const handleNewMessage = (message: Message) => {
            console.log('New message received:', message);
            // Only add message if it's not from current user (to avoid duplicate from sendMessageSuccess)
            // Or if it's from current user but not in current conversation (other device/tab)
            const isFromCurrentUser = user?.id && message.senderId === user.id.toString();
            const isCurrentConversation = message.conversationId === selectedConversationId;
            
            // Add message if:
            // 1. Not from current user (someone else sent it)
            // 2. Or from current user but not in current conversation (sent from another device/tab)
            if (!isFromCurrentUser || !isCurrentConversation) {
                dispatch(addNewMessage(message));
            }
        };

        // Listen for messages read
        const handleMessagesRead = (data: { conversationId: string; userId: string; readCount: number }) => {
            console.log('Messages read:', data);
            // Update conversation unread count
            // This will be handled by the conversation list refresh
        };

        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            if (socket) {
                socket.off('new_message', handleNewMessage);
                socket.off('messages_read', handleMessagesRead);
            }
        };
    }, [isAuthenticated, accessToken, dispatch]);

    // Join/leave conversation rooms
    useEffect(() => {
        if (!socketRef.current || !selectedConversationId) {
            return;
        }

        const socket = socketRef.current;
        const room = selectedConversationId;

        // Leave previous rooms
        joinedRoomsRef.current.forEach((prevRoom) => {
            if (prevRoom !== room) {
                socket.emit('leave_conversation', { conversationId: prevRoom });
                joinedRoomsRef.current.delete(prevRoom);
            }
        });

        // Join current conversation
        if (!joinedRoomsRef.current.has(room)) {
            socket.emit('join_conversation', { conversationId: room });
            joinedRoomsRef.current.add(room);
        }

        return () => {
            if (socket && selectedConversationId) {
                socket.emit('leave_conversation', { conversationId: selectedConversationId });
                joinedRoomsRef.current.delete(selectedConversationId);
            }
        };
    }, [selectedConversationId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Don't disconnect socket on unmount, keep it alive
            // Only disconnect when user logs out
        };
    }, []);
};

