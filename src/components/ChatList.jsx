import { ChevronDown, SquarePen } from 'lucide-react';

export default function ChatList({ chats, selectedChat, onSelectChat, currentUser }) {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            {/* Header */}
            <div className="h-[75px] px-6 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-1 cursor-pointer group">
                    <h2 className="text-xl font-bold">{currentUser?.username || 'Messages'}</h2>
                    <ChevronDown className="w-5 h-5 transition-transform group-hover:opacity-70" />
                </div>
                <button className="p-2 hover:opacity-70 transition-opacity">
                    <SquarePen className="w-6 h-6" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors ${selectedChat?.id === chat.id ? 'bg-gray-100 dark:bg-zinc-800' : ''
                            }`}
                    >
                        <div className="relative flex-shrink-0">
                            <img
                                src={chat.avatar || '/placeholder.svg'}
                                alt={chat.username}
                                className="w-[56px] h-[56px] rounded-full object-cover border border-gray-100 dark:border-zinc-800"
                            />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="font-normal text-sm dark:text-gray-100 truncate">
                                {chat.username}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <p className={`text-xs truncate min-w-0 flex-1 ${chat.unread > 0 ? 'text-black dark:text-white font-semibold' : 'text-gray-500'}`}>
                                    {chat.lastMessage || 'Sent a message'}
                                </p>
                                <span className="text-[10px] text-gray-500 flex-shrink-0">· {chat.timestamp}</span>
                            </div>
                        </div>
                        {chat.unread > 0 && (
                            <div className="w-2 h-2 bg-ig-primary rounded-full ml-2 flex-shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
