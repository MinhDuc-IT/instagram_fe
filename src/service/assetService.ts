import axios from '../utils/axiosCustomize';
import { UploadResponse } from '../types/upload.types';

interface AssetQueryParams {
    type?: 'image' | 'video';
    skip?: number;
    take?: number;
}

interface AssetStats {
    totalImages: number;
    totalVideos: number;
    totalAssets: number;
    totalSize: number;
}

interface TransformOptions {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'crop' | 'thumb' | 'scale';
    quality?: number | 'auto';
    format?: string;
}

interface ResponsiveUrls {
    mobile: string;
    tablet: string;
    desktop: string;
    original: string;
}

class AssetService {
    /**
     * Get all assets with pagination
     */
    async getAssets(params?: AssetQueryParams): Promise<{
        data: UploadResponse[];
        pagination: { skip: number; take: number; total: number };
    }> {
        const response = await axios.get('/api/assets', { params });
        return response.data;
    }

    /**
     * Get asset statistics
     */
    async getStats(): Promise<AssetStats> {
        const response = await axios.get<AssetStats>('/api/assets/stats');
        return response.data;
    }

    /**
     * Get asset by public ID
     */
    async getAssetByPublicId(publicId: string): Promise<UploadResponse> {
        const response = await axios.get<UploadResponse>(`/api/assets/${publicId}`);
        return response.data;
    }

    /**
     * Get transformation URL
     */
    async getTransformUrl(
        publicId: string,
        options?: TransformOptions
    ): Promise<{
        publicId: string;
        originalUrl: string;
        transformUrl: string;
        options: TransformOptions;
    }> {
        const response = await axios.get(`/api/assets/${publicId}/transform`, {
            params: options,
        });
        return response.data;
    }

    /**
     * Get responsive URLs
     */
    async getResponsiveUrls(publicId: string): Promise<{
        publicId: string;
        originalUrl: string;
        responsive: ResponsiveUrls;
    }> {
        const response = await axios.get(`/api/assets/${publicId}/responsive`);
        return response.data;
    }

    /**
     * Get thumbnail URL
     */
    async getThumbnail(
        publicId: string,
        size?: number
    ): Promise<{
        publicId: string;
        thumbnailUrl: string;
    }> {
        const response = await axios.get(`/api/assets/${publicId}/thumbnail`, {
            params: { size },
        });
        return response.data;
    }

    /**
     * Delete asset
     */
    async deleteAsset(publicId: string): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await axios.delete(`/api/assets/${publicId}`);
        return response.data;
    }
}

export default new AssetService();