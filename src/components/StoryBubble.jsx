"use client"

export default function StoryBubble({ user, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-shrink-0">
      <div
        className={`w-16 h-16 rounded-full p-0.5 ${
          user.hasStory
            ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500"
            : "bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <div className="w-full h-full rounded-full border-2 border-white dark:border-black p-0.5">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.username}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
      <span className="text-xs text-gray-900 dark:text-white truncate w-16 text-center">{user.username}</span>
    </button>
  )
}
