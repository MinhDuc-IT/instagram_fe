import { useState, useCallback, useRef } from 'react';
import { MediaFile } from '../types/media.types';

export const useFileSelection = () => {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((files: File[]) => {
        const newMediaFiles: MediaFile[] = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'video',
        }));

        setMediaFiles(prev => [...prev, ...newMediaFiles]);
        return newMediaFiles;
    }, []);

    const removeMedia = useCallback((id: string) => {
        setMediaFiles(prev => {
            const media = prev.find(m => m.id === id);
            if (media) {
                URL.revokeObjectURL(media.preview);
            }
            return prev.filter(m => m.id !== id);
        });
    }, []);

    const clearAll = useCallback(() => {
        mediaFiles.forEach(media => {
            URL.revokeObjectURL(media.preview);
        });
        setMediaFiles([]);
    }, [mediaFiles]);

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return {
        mediaFiles,
        setMediaFiles,
        fileInputRef,
        handleFileSelect,
        removeMedia,
        clearAll,
        openFileDialog,
    };
};