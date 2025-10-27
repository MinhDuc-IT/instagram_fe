export interface UploadResponse {
    success: boolean;
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    width?: number;
    height?: number;
    duration?: number;
    fileSize: number;
    timestamp: Date;
}

export interface JobResponse {
    jobId: string;
    message: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface JobStatusResponse {
    id: string;
    type: 'image' | 'video';
    fileName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: UploadResponse;
    error?: string;
    progress: number;
    createdDate: Date;
    completedAt?: Date;
    retryCount: number;
    maxRetries: number;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}