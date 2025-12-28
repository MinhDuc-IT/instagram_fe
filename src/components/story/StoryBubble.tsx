import { UserStoryGroup } from "../../types/story.type"

interface Props {
  group: UserStoryGroup
  onClick?: () => void
}

export default function StoryBubble({ group, onClick }: Props) {
  const { user, hasUnseen } = group
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div className={`w-16 h-16 rounded-full p-0.5 ${hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : 'bg-gray-300'}`}>
        <img
          src={user.avatar || "/placeholder.svg"}
          alt={user.userName}
          className="w-full h-full rounded-full object-cover border-2 border-white"
        />
      </div>
      <span className="text-xs truncate w-16 text-center">{user.userName}</span>
    </button>
  )
}
