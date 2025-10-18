import { useApp } from "../context/AppContext"

export default function Notifications() {
  const { notifications } = useApp()

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors"
          >
            <img
              src={notification.avatar || "/placeholder.svg"}
              alt={notification.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold">{notification.username}</span> {notification.text}
              </p>
              <span className="text-xs text-gray-500">{notification.timestamp}</span>
            </div>
            {notification.postImage && (
              <img
                src={notification.postImage || "/placeholder.svg"}
                alt="Post"
                className="w-12 h-12 object-cover rounded"
              />
            )}
            {notification.type === "follow" && <button className="btn-primary text-sm px-4 py-1">Follow</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
