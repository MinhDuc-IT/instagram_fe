'use client';

export default function ChatList({ chats, selectedChat, onSelectChat }) {
    return (
        <div className="border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold">Messages</h2>
            </div>
            <div>
                {chats.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors ${
                            selectedChat?.id === chat.id ? 'bg-gray-100 dark:bg-gray-900' : ''
                        }`}
                    >
                        <img
                            src={chat.avatar || '/placeholder.svg'}
                            alt={chat.username}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">{chat.username}</span>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{chat.timestamp}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm text-gray-500 truncate min-w-0 flex-1">
                                    {chat.lastMessage || ''}
                                </p>
                                {chat.unread > 0 && (
                                    <span className="bg-ig-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
