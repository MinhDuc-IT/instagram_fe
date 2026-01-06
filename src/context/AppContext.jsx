// "use client"

// import { createContext, useContext, useState, useEffect } from "react"
// import { posts as initialPosts } from "../data/posts"
// import { users as initialUsers, currentUser as initialCurrentUser } from "../data/users"
// import { notifications as initialNotifications, messages as initialMessages } from "../data/posts"

// const AppContext = createContext()

// export const useApp = () => {
//   const context = useContext(AppContext)
//   if (!context) {
//     throw new Error("useApp must be used within AppProvider")
//   }
//   return context
// }

// export const AppProvider = ({ children }) => {
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem("theme") || "light"
//   })

//   const [posts, setPosts] = useState(initialPosts)
//   const [users, setUsers] = useState(initialUsers)
//   const [currentUser, setCurrentUser] = useState(initialCurrentUser)
//   const [notifications, setNotifications] = useState(initialNotifications)
//   const [messages, setMessages] = useState(initialMessages)
//   const [isAuthenticated, setIsAuthenticated] = useState(() => {
//     return localStorage.getItem("isAuthenticated") === "true" 
//   })

//   useEffect(() => {
//     if (theme === "dark") {
//       document.documentElement.classList.add("dark")
//     } else {
//       document.documentElement.classList.remove("dark")
//     }
//     localStorage.setItem("theme", theme)
//   }, [theme])

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === "light" ? "dark" : "light"))
//   }

//   const login = (username, password) => {
//     // Simple mock login
//     if (username && password) {
//       setIsAuthenticated(true)
//       localStorage.setItem("isAuthenticated", "true")
//       return true
//     }
//     return false
//   }

//   const logout = () => {
//     setIsAuthenticated(false)
//     localStorage.removeItem("isAuthenticated")
//   }

//   const toggleLike = (postId) => {
//     setPosts((prevPosts) =>
//       prevPosts.map((post) =>
//         post.id === postId
//           ? {
//               ...post,
//               isLiked: !post.isLiked,
//               likes: post.isLiked ? post.likes - 1 : post.likes + 1,
//             }
//           : post,
//       ),
//     )
//   }

//   const toggleSave = (postId) => {
//     setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isSaved: !post.isSaved } : post)))
//   }

//   const addComment = (postId, commentText) => {
//     setPosts((prevPosts) =>
//       prevPosts.map((post) =>
//         post.id === postId
//           ? {
//               ...post,
//               comments: [
//                 ...post.comments,
//                 {
//                   id: post.comments.length + 1,
//                   username: currentUser.username,
//                   text: commentText,
//                   avatar: currentUser.avatar,
//                 },
//               ],
//             }
//           : post,
//       ),
//     )
//   }

//   const toggleFollow = (userId) => {
//     setUsers((prevUsers) =>
//       prevUsers.map((user) =>
//         user.id === userId
//           ? {
//               ...user,
//               isFollowing: !user.isFollowing,
//               followers: user.isFollowing ? user.followers - 1 : user.followers + 1,
//             }
//           : user,
//       ),
//     )
//   }

//   const createPost = (image, caption) => {
//     const newPost = {
//       id: posts.length + 1,
//       userId: currentUser.id,
//       username: currentUser.username,
//       userAvatar: currentUser.avatar,
//       image,
//       caption,
//       likes: 0,
//       comments: [],
//       timestamp: "Just now",
//       isLiked: false,
//       isSaved: false,
//     }
//     setPosts([newPost, ...posts])
//   }

//   const sendMessage = (chatId, messageText) => {
//     setMessages((prevMessages) =>
//       prevMessages.map((chat) =>
//         chat.id === chatId
//           ? {
//               ...chat,
//               messages: [
//                 ...chat.messages,
//                 {
//                   id: chat.messages.length + 1,
//                   senderId: 0,
//                   text: messageText,
//                   timestamp: "Just now",
//                 },
//               ],
//               lastMessage: messageText,
//               timestamp: "Just now",
//             }
//           : chat,
//       ),
//     )
//   }

//   const updateProfile = (updates) => {
//     setCurrentUser((prev) => ({ ...prev, ...updates }))
//   }

//   const value = {
//     theme,
//     toggleTheme,
//     posts,
//     users,
//     currentUser,
//     notifications,
//     messages,
//     isAuthenticated,
//     login,
//     logout,
//     toggleLike,
//     toggleSave,
//     addComment,
//     toggleFollow,
//     createPost,
//     sendMessage,
//     updateProfile,
//   }

//   return <AppContext.Provider value={value}>{children}</AppContext.Provider>
// }
