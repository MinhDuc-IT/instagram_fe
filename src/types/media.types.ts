import { UploadResponse } from './upload.types';

export interface MediaFile {
    id: string;
    file: File;
    preview: string;
    type: 'image' | 'video';
    uploadResponse?: UploadResponse;
    uploading?: boolean;
    progress?: number;
    error?: string;
    selectedFilter?: number;
}

export interface FilterOption {
    name: string;
    filter: string;
}

export interface CreatePostData {
    caption: string;
    location?: string;
    mediaFiles: MediaFile[];
    selectedFilter: number;
    hideStats?: boolean;
    disableComments?: boolean;
}