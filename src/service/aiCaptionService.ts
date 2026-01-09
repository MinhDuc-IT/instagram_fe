import axios from '../utils/axiosCustomize';

export interface GenerateCaptionRequest {
    userDescription: string;
    language?: 'vi' | 'en';
    intent: 'branding' | 'sell' | 'viral' | 'story' | 'reviews' | 'promotion' | 'education' | 'inspiration' | 'tips' | 'quotes' | 'humor';
    tone?: 'natural' | 'genz' | 'professional' | 'emotional';
    brandStyle?: string;
    maxVariants?: number;
}

export interface CaptionVariant {
    text: string;
    type: string;
}

export interface GenerateCaptionResponse {
    captions: CaptionVariant[];
}

export const AiCaptionService = {
    async generate(data: GenerateCaptionRequest | FormData): Promise<GenerateCaptionResponse> {
        try {
            const isFormData = data instanceof FormData;
            const response = await axios.post('/captions/generate', data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
            });
            return response as any as GenerateCaptionResponse;
        } catch (error) {
            console.error('Error in AiCaptionService.generate:', error);
            throw error;
        }
    }
};
