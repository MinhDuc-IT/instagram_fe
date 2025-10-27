import { useState, useCallback } from 'react';
import uploadService from '../service/uploadService';
import { MediaFile } from '../types/media.types';
import { UploadResponse } from '../types/upload.types';

export const useMediaUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const uploadFile = useCallback(
        async (media: MediaFile, background: boolean = false): Promise<UploadResponse> => {
            try {
                if (background) {
                    // Background upload (for videos)
                    const jobResponse = media.type === 'image'
                        ? await uploadService.uploadImageBackground(media.file)
                        : await uploadService.uploadVideoBackground(media.file);

                    // Poll for status
                    return await pollJobStatus(jobResponse.jobId, media.id);
                } else {
                    // Synchronous upload (for images)
                    const result = media.type === 'image'
                        ? await uploadService.uploadImage(media.file, (progress) => {
                            setUploadProgress(prev => ({
                                ...prev,
                                [media.id]: progress.percentage,
                            }));
                        })
                        : await uploadService.uploadVideo(media.file, (progress) => {
                            setUploadProgress(prev => ({
                                ...prev,
                                [media.id]: progress.percentage,
                            }));
                        });

                    return result;
                }
            } catch (error: any) {
                throw new Error(error.response?.data?.message || 'Upload failed');
            }
        },
        []
    );

    const pollJobStatus = useCallback(
        async (jobId: string, mediaId: string): Promise<UploadResponse> => {
            return new Promise((resolve, reject) => {
                const interval = setInterval(async () => {
                    try {
                        const job = await uploadService.getJobStatus(jobId);

                        setUploadProgress(prev => ({
                            ...prev,
                            [mediaId]: job.progress,
                        }));

                        if (job.status === 'completed' && job.result) {
                            clearInterval(interval);
                            resolve(job.result);
                        } else if (job.status === 'failed') {
                            clearInterval(interval);
                            reject(new Error(job.error || 'Upload failed'));
                        }
                    } catch (error) {
                        clearInterval(interval);
                        reject(error);
                    }
                }, 2000);
            });
        },
        []
    );

    const uploadMultiple = useCallback(
        async (mediaFiles: MediaFile[]): Promise<UploadResponse[]> => {
            setUploading(true);

            try {
                const uploadPromises = mediaFiles.map(media =>
                    uploadFile(media, media.type === 'video')
                );

                const results = await Promise.all(uploadPromises);
                return results;
            } finally {
                setUploading(false);
                setUploadProgress({});
            }
        },
        [uploadFile]
    );

    return {
        uploading,
        uploadProgress,
        uploadFile,
        uploadMultiple,
    };
};