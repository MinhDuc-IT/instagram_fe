import { useState, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { markStoryViewed } from "../../redux/features/story/storySlice"
import { storyService } from "../../service/storyService"
import { UserStoryGroup } from "../../types/story.type"

interface Props {
    group: UserStoryGroup
    onClose: () => void
}

export default function StoryViewerModal({ group, onClose }: Props) {
    const dispatch = useDispatch()
    // Find first unseen story or start from 0
    const initialIndex = group.stories.findIndex(s => !s.isViewed)
    const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0)
    const [progress, setProgress] = useState(0)

    const currentStory = group.stories[currentIndex]
    const DURATION = 5000 // 5s per story

    const timerRef = useRef<NodeJS.Timeout | number>(0)

    // Handle viewing API and state update
    useEffect(() => {
        if (!currentStory) return

        // If not viewed, mark as viewed
        if (!currentStory.isViewed) {
            storyService.viewStory(currentStory.id) // Async API call
            dispatch(markStoryViewed(currentStory.id))
        }
    }, [currentStory, dispatch])

    // Progress timer
    useEffect(() => {
        setProgress(0)
        const startTime = Date.now()

        clearInterval(timerRef.current as number)

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime
            const p = (elapsed / DURATION) * 100

            if (p >= 100) {
                nextStory()
            } else {
                setProgress(p)
            }
        }, 50)

        return () => clearInterval(timerRef.current as number)
    }, [currentIndex])

    const nextStory = () => {
        if (currentIndex < group.stories.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            onClose() // Close if last story
        }
    }

    const prevStory = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    if (!currentStory) return null

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            {/* Container */}
            <div className="relative w-full h-full md:w-[400px] md:h-[90vh] bg-gray-900 md:rounded-xl overflow-hidden">

                {/* Progress Bars */}
                <div className="absolute top-4 left-0 w-full px-2 flex gap-1 z-20">
                    {group.stories.map((s, idx) => (
                        <div key={s.id} className="h-0.5 bg-gray-600 flex-1 rounded overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-75 ease-linear"
                                style={{
                                    width: idx < currentIndex ? '100%' :
                                        idx === currentIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 z-20 flex items-center gap-3">
                    <img src={group.user.avatar || "/placeholder.svg"} className="w-8 h-8 rounded-full" />
                    <span className="text-white font-semibold text-sm">{group.user.userName}</span>
                    <span className="text-gray-300 text-xs">{new Date(currentStory.createdAt).toLocaleTimeString()}</span>
                </div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-8 right-4 text-white z-30">✕</button>

                {/* Content */}
                <div className="w-full h-full flex items-center justify-center bg-black">
                    {currentStory.type === 'video' ? (
                        <video
                            src={currentStory.mediaUrl}
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <img
                            src={currentStory.mediaUrl}
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>

                {/* Navigation Overlays */}
                <div className="absolute inset-0 flex z-10">
                    <div className="w-1/3 h-full" onClick={prevStory}></div>
                    <div className="w-2/3 h-full" onClick={(e) => { e.stopPropagation(); nextStory(); }}></div>
                </div>

                {/* Footer (Reply) */}
                <div className="absolute bottom-4 left-0 w-full px-4 z-20">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Send Message"
                            className="w-full bg-transparent border border-white/50 rounded-full py-3 px-4 text-white placeholder-white/70 focus:outline-none focus:border-white"
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}
