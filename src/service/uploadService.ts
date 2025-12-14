import axios from '../utils/axiosCustomize';
import { UploadResponse, JobResponse, JobStatusResponse, UploadProgress } from '../types/upload.types';

class UploadService {
    /**
     * Upload image synchronously
     */
    async uploadImage(
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post<UploadResponse>('/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percentage,
                    });
                }
            },
        });

        console.log("UploadService uploadImage response:", response);
        return response;
    }

    /**
     * Upload video synchronously
     */
    async uploadVideo(
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post<UploadResponse>('/api/upload/video', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percentage,
                    });
                }
            },
        });

        return response;
    }

    /**
     * Upload image in background
     */
    async uploadImageBackground(file: File): Promise<JobResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post<JobResponse>('/api/upload/image/background', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    /**
     * Upload video in background
     */
    async uploadVideoBackground(file: File): Promise<JobResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post<JobResponse>('/api/upload/video/background', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    /**
     * Get job status
     */
    async getJobStatus(jobId: string): Promise<JobStatusResponse> {
        const response = await axios.get<JobStatusResponse>(`/api/upload/job/${jobId}`);
        return response.data;
    }

    /**
     * Get all jobs
     */
    async getAllJobs(): Promise<JobStatusResponse[]> {
        const response = await axios.get<JobStatusResponse[]>('/api/upload/jobs');
        return response.data;
    }

    /**
     * Get jobs by status
     */
    async getJobsByStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): Promise<JobStatusResponse[]> {
        const response = await axios.get<JobStatusResponse[]>(`/api/upload/jobs/status/${status}`);
        return response.data;
    }

    /**
     * Delete job
     */
    async deleteJob(jobId: string): Promise<{ success: boolean }> {
        const response = await axios.delete<{ success: boolean }>(`/api/upload/job/${jobId}`);
        return response.data;
    }
}

export default new UploadService();
