"use client"

import { useState } from "react"
import { useApp } from "../context/AppContext"
import ChatList from "../components/ChatList"
import MessageBox from "../components/MessageBox"

export default function Messages() {
  const { messages } = useApp()
  const [selectedChat, setSelectedChat] = useState(null)

  return (
    <div className="h-screen flex">
      {/* Chat List */}
      <div className="w-full md:w-96 flex-shrink-0">
        <ChatList chats={messages} selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      </div>

      {/* Message Box */}
      <div className="hidden md:flex flex-1">
        <MessageBox chat={selectedChat} />
      </div>

      {/* Mobile Message Box */}
      {selectedChat && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-black z-50">
          <MessageBox chat={selectedChat} />
          <button onClick={() => setSelectedChat(null)} className="absolute top-4 left-4 text-ig-primary font-semibold">
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
