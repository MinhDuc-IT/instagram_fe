import { User } from "../types/user.type"

interface Props {
  user: User & { hasStory?: boolean }
  onClick?: () => void
}

export default function StoryBubble({ user, onClick }: Props) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500">
        <img
          src={user.avatar || "/placeholder.svg"}
          alt={user.username}
          className="w-full h-full rounded-full object-cover border-2 border-white"
        />
      </div>
      <span className="text-xs truncate w-16 text-center">{user.username}</span>
    </button>
  )
}
