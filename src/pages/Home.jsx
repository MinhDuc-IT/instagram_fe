// import { useApp } from "../context/AppContext"
import { useSelector } from "react-redux"
import PostCard from "../components/PostCard"
import StoryBubble from "../components/StoryBubble"

export default function Home() {
  // const { posts, users, currentUser } = useApp()
  const { currentUser } = useSelector((state) => state.auth);

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      {/* Stories */}
      <div className="card p-4 mb-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-4">
          {/* <StoryBubble user={{ ...currentUser, hasStory: false }} /> */}
          {/* {users
            .filter((u) => u.hasStory)
            .map((user) => (
              <StoryBubble key={user.id} user={user} />
            ))} */}
        </div>
      </div>

      {/* Posts */}
      <div>
        {/* {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))} */}
      </div>
    </div>
  )
}
