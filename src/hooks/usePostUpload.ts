import { useState } from 'react';
import { MediaFile } from '../types/media.types';
import { PostService } from '../service/postService';

export const usePostUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadPost = async (
        caption: string,
        location: string,
        visibility: string,
        isLikesHidden: boolean,
        isCommentsDisabled: boolean,
        mediaFiles: MediaFile[]
    ) => {
        try {
            setUploading(true);
            setUploadProgress(10);

            const token = localStorage.getItem('access_token');
            // if (!token) throw new Error('Missing access token');

            setUploadProgress(30);
            const result = await PostService.uploadPost(
                token,
                caption,
                location,
                visibility,
                isLikesHidden,
                isCommentsDisabled,
                mediaFiles
            );

            setUploadProgress(100);
            return result;
        } catch (err) {
            console.error('Upload post failed:', err);
            throw err;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return { uploading, uploadProgress, uploadPost };
};
