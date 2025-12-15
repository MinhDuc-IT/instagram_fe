"use client";

import { X, Trash2, Plus } from "lucide-react";
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

    const removeMedia = (id: string) => {
        setMedia((prev) => prev.filter((m) => m.id !== id));
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
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-900 w-[600px] rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <button onClick={onClose}>
                        <X />
                    </button>

                    <span className="font-semibold">Edit Post</span>

                    <button
                        onClick={save}
                        disabled={saving}
                        className="text-blue-500 font-semibold disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Done"}
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Media grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {media.map((m) => (
                            <div key={m.id} className="relative group">
                                {m.type === "video" ? (
                                    <video src={m.url} className="h-32 w-full object-cover" />
                                ) : (
                                    <img src={m.url} className="h-32 w-full object-cover" />
                                )}

                                <button
                                    onClick={() => removeMedia(m.id)}
                                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {/* Add media */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                            disabled={uploading}
                        >
                            <Plus />
                        </button>
                    </div>

                    {/* Upload progress */}
                    {uploading && uploadProgress !== null && (
                        <div className="text-sm text-gray-500">
                            Uploading... {uploadProgress}%
                        </div>
                    )}

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

                    {/* Caption */}
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={4}
                        placeholder="Write a caption..."
                        className="w-full resize-none bg-gray-100 dark:bg-gray-800 p-3 rounded"
                    />

                    {/* Allow comments */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Allow comments</span>
                        <input
                            type="checkbox"
                            checked={!commentsDisabled}
                            onChange={(e) => setCommentsDisabled(!e.target.checked)}
                        />
                    </div>

                    {/* Hide likes */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Hide like count</span>
                        <input
                            type="checkbox"
                            checked={likesHidden}
                            onChange={(e) => setLikesHidden(e.target.checked)}
                        />
                    </div>

                    {/* Visibility */}
                    <div className="space-y-1">
                        <span className="text-sm font-medium">Visibility</span>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                            className="w-full bg-gray-100 dark:bg-gray-800 p-2 rounded"
                        >
                            <option value="public">Public</option>
                            <option value="followers">Followers</option>
                            <option value="private">Only me</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}