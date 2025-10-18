"use client"

import { useState } from "react"
import { Send, Heart, MessageCircle } from "lucide-react"
import { useApp } from "../context/AppContext"

export default function MessageBox({ chat }) {
  const { sendMessage, currentUser } = useApp()
  const [message, setMessage] = useState("")

  const handleSend = (e) => {
    e.preventDefault()
    if (message.trim()) {
      sendMessage(chat.id, message)
      setMessage("")
    }
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
          <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
          <p className="text-gray-500">Send private photos and messages to a friend or group.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <img
          src={chat.avatar || "/placeholder.svg"}
          alt={chat.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-semibold">{chat.username}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 0 ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-full ${
                msg.senderId === 0 ? "bg-ig-primary text-white" : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 input-field"
          />
          <button type="button" className="p-2 hover:text-gray-500 transition-colors">
            <Heart className="w-6 h-6" />
          </button>
          <button
            type="submit"
            disabled={!message.trim()}
            className="text-ig-primary font-semibold disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  )
}
