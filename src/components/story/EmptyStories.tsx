import React from "react"
import { Camera } from "lucide-react"

export default function EmptyStories() {
    return (
        <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
            <Camera size={32} className="mb-2 opacity-70" />
            <p className="text-sm">No stories to show</p>
        </div>
    )
}
