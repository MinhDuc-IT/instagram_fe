import { useState } from "react"
import { Image, Video, X, ChevronLeft } from "lucide-react"
import { Post } from "../../types/post.type";

interface Props {
    onClose: () => void
    onSubmit: (file?: File, postId?: string) => void
    sharedPost?: Post | null
}

export default function AddStoryModal({ onClose, onSubmit, sharedPost }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0]
            setFile(selected)
            setPreviewUrl(URL.createObjectURL(selected))
        }
    }

    const handleSubmit = () => {
        if (sharedPost) {
            onSubmit(undefined, sharedPost.id)
        } else if (file) {
            onSubmit(file)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
            >
                <X size={32} />
            </button>

            <div className={`relative w-full max-w-md h-[80vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center ${!file && !sharedPost ? 'border-2 border-dashed border-gray-700' : ''}`}>

                {!file && !sharedPost ? (
                    <div className="text-center space-y-6 p-8">
                        <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 p-[2px]">
                            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                                <Image size={32} className="text-white" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white">Add to Story</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                            Share a photo or video to your story. It will disappear after 24 hours.
                        </p>

                        <label className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full cursor-pointer transition-all transform hover:scale-105 active:scale-95">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                hidden
                                onChange={handleFileSelect}
                            />
                            <span>Select from Computer</span>
                        </label>
                    </div>
                ) : (
                    <>
                        <div className="relative w-full h-full bg-black flex items-center justify-center p-4">
                            {sharedPost ? (
                                // Shared Post Preview Card
                                <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <img
                                            src={sharedPost.userAvatar || "/placeholder.svg"}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="font-semibold text-black text-sm">
                                            {sharedPost.username}
                                        </span>
                                    </div>

                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                                        {sharedPost.media?.[0]?.type === 'video' ? (
                                            <video
                                                src={sharedPost.media[0].url}
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                muted
                                                loop
                                            />
                                        ) : (
                                            <img
                                                src={sharedPost.media?.[0]?.url || "/placeholder.svg"}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    <div className="text-black text-sm line-clamp-2">
                                        <span className="font-semibold mr-1">{sharedPost.username}</span>
                                        {sharedPost.caption}
                                    </div>
                                </div>
                            ) : (
                                // File Preview
                                file?.type.startsWith("image") ? (
                                    <img src={previewUrl!} className="w-full h-full object-contain" alt="Preview" />
                                ) : (
                                    <video src={previewUrl!} className="w-full h-full object-contain" autoPlay loop muted />
                                )
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
                        </div>

                        {/* Footer Controls */}
                        <div className="absolute bottom-0 left-0 w-full p-6 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
                            <button
                                onClick={() => { setFile(null); setPreviewUrl(null); }}
                                className="text-white text-sm font-semibold flex items-center gap-1 hover:text-gray-300"
                            >
                                <ChevronLeft size={20} />
                                Discard
                            </button>

                            <button
                                onClick={handleSubmit}
                                className="bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
                            >
                                Share to Story
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
