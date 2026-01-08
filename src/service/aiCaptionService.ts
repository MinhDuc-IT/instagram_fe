import axios from '../utils/axiosCustomize';

export interface GenerateCaptionRequest {
    userDescription: string;
    language?: 'vi' | 'en';
    intent?: 'branding' | 'sell' | 'viral' | 'story';
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
    async generate(data: GenerateCaptionRequest): Promise<GenerateCaptionResponse> {
        try {
            const response = await axios.post('/captions/generate', data);
            return response as any as GenerateCaptionResponse;
        } catch (error) {
            console.error('Error in AiCaptionService.generate:', error);
            throw error;
        }
    }
};
