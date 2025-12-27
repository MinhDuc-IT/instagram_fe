import React from "react"

export default function StorySkeleton() {
    return (
        <div className="flex gap-4 px-4 py-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
                    <div className="w-12 h-3 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
                </div>
            ))}
        </div>
    )
}