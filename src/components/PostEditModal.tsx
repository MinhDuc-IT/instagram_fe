"use client";

import { X, Trash2, Plus, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { Post, PostVisibility, Media } from "../types/post.type";
import UploadService from "../service/uploadService";
import { PostService } from "../service/postService";
import { updatePost } from "../redux/features/user/userSlice";

interface Props {
    post: Post;
    onClose: () => void;
}

export default function PostEditModal({ post, onClose }: Props) {
    const dispatch = useDispatch();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [caption, setCaption] = useState(post.caption || "");
    const [media, setMedia] = useState<Media[]>(post.media || []);

    const [commentsDisabled, setCommentsDisabled] = useState(
        post.isCommentsDisabled ?? false
    );
    const [likesHidden, setLikesHidden] = useState(
        post.isLikesHidden ?? false
    );
    const [visibility, setVisibility] = useState<PostVisibility>(
        post.visibility ?? "public"
    );

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const removeMedia = (id: string) => {
        setMedia((prev) => prev.filter((m) => m.id !== id));
        if (currentMediaIndex >= media.length - 1) {
            setCurrentMediaIndex(Math.max(0, media.length - 2));
        }
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        setUploadProgress(0);

        try {
            const isVideo = file.type.startsWith("video");

            const res = isVideo
                ? await UploadService.uploadVideo(file, (p) =>
                    setUploadProgress(p.percentage)
                )
                : await UploadService.uploadImage(file, (p) =>
                    setUploadProgress(p.percentage)
                );

            const newMedia: Media = {
                id: res.id,
                publicId: res.publicId,
                fileName: res.fileName,
                secureUrl: res.secureUrl,
                format: res.format,
                width: res.width ?? 0,
                height: res.height ?? 0,
                duration: res.duration ?? 0,
                fileSize: res.fileSize,
                url: res.secureUrl || res.url,
                type: isVideo ? "video" : "image",
            };

            setMedia((prev) => [...prev, newMedia]);
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        } finally {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    const save = async () => {
        setSaving(true);

        const updatedPost: Post = {
            ...post,
            caption,
            media,
            isCommentsDisabled: commentsDisabled,
            isLikesHidden: likesHidden,
            visibility,
        };

        const payload = {
            caption,
            mediaIds: media.map((m) => m.id),
            isCommentsDisabled: commentsDisabled,
            isLikesHidden: likesHidden,
            visibility,
        };

        // optimistic update
        dispatch(updatePost(updatedPost));

        try {
            await PostService.update(post.id, payload);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Update failed");
            dispatch(updatePost(post)); // rollback
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl h-[80vh] max-h-[800px] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Left: Media Preview */}
                <div className="hidden md:flex flex-1 bg-black items-center justify-center relative bg-gray-100 dark:bg-zinc-950">
                    {media.length > 0 ? (
                        <>
                            <div className="relative w-full h-full flex items-center justify-center">
                                {media[currentMediaIndex].type === "video" ? (
                                    <video
                                        src={media[currentMediaIndex].url}
                                        className="max-w-full max-h-full object-contain"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={media[currentMediaIndex].url}
                                        className="max-w-full max-h-full object-contain"
                                        alt="Preview"
                                    />
                                )}
                            </div>

                            {/* Media Navigation if multiple */}
                            {media.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentMediaIndex(c => c > 0 ? c - 1 : c)}
                                        className={`absolute left-4 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-opacity ${currentMediaIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentMediaIndex(c => c < media.length - 1 ? c + 1 : c)}
                                        className={`absolute right-4 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-opacity ${currentMediaIndex === media.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}

                            {/* Pagination Dots */}
                            {media.length > 1 && (
                                <div className="absolute bottom-4 flex gap-1.5">
                                    {media.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentMediaIndex ? 'bg-white' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-500">No media</div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col border-l border-gray-100 dark:border-zinc-800">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                        <button onClick={onClose} className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300">
                            Cancel
                        </button>
                        <span className="font-semibold text-base">Edit info</span>
                        <button
                            onClick={save}
                            disabled={saving}
                            className="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-50"
                        >
                            {saving ? "Done" : "Done"}
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* Caption */}
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                <img
                                    src={post.userAvatar || "/placeholder.svg"}
                                    alt={post.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    rows={6}
                                    placeholder="Write a caption..."
                                    className="w-full bg-transparent border-none p-0 resize-none focus:ring-0 text-sm leading-relaxed"
                                />
                                <div className="flex justify-end text-xs text-gray-400 border-b border-gray-100 dark:border-zinc-800 pb-2">
                                    {caption.length} / 2200
                                </div>
                            </div>
                        </div>

                        {/* Media Management - "Edit Grid" style */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-500">Media</span>
                                <span className="text-xs text-blue-500 cursor-pointer" onClick={() => fileInputRef.current?.click()}>Add Photos/Videos</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {media.map((m, idx) => (
                                    <div key={m.id} className="relative group aspect-square rounded overflow-hidden cursor-pointer" onClick={() => setCurrentMediaIndex(idx)}>
                                        {m.type === "video" ? (
                                            <video src={m.url} className={`w-full h-full object-cover ${currentMediaIndex === idx ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} />
                                        ) : (
                                            <img src={m.url} className={`w-full h-full object-cover ${currentMediaIndex === idx ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} />
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeMedia(m.id); }}
                                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border border-dashed border-gray-300 dark:border-zinc-700 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader className="animate-spin w-4 h-4" /> : <Plus size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="space-y-4 pt-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                accept="image/*,video/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadFile(file);
                                    e.target.value = "";
                                }}
                            />

                            {/* <div className="h-px bg-gray-100 dark:bg-zinc-800" /> */}

                            <div className="flex items-center justify-between py-2 cursor-pointer group">
                                <span className="text-sm">Turn off commenting</span>
                                <input
                                    type="checkbox"
                                    checked={commentsDisabled}
                                    onChange={(e) => setCommentsDisabled(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0"
                                />
                            </div>

                            <div className="flex items-center justify-between py-2 cursor-pointer group">
                                <span className="text-sm">Hide like count on this post</span>
                                <input
                                    type="checkbox"
                                    checked={likesHidden}
                                    onChange={(e) => setLikesHidden(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0"
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <span className="text-sm text-gray-500 block">Who can see this post?</span>
                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-2 rounded text-sm focus:outline-none focus:border-gray-400"
                                >
                                    <option value="public">Public</option>
                                    <option value="followers">Followers Only</option>
                                    <option value="private">Private (Only Me)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}