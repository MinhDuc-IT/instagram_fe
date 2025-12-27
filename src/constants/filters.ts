import { FilterOption } from '../types/media.types';

export const FILTERS: FilterOption[] = [
    { name: 'Normal', filter: 'none' },
    { name: 'Clarendon', filter: 'brightness(1.1) contrast(1.2) saturate(1.2)' },
    { name: 'Gingham', filter: 'brightness(1.05) hue-rotate(-10deg)' },
    { name: 'Moon', filter: 'grayscale(1) contrast(1.1) brightness(1.1)' },
    { name: 'Lark', filter: 'contrast(0.9) brightness(1.1) saturate(1.2)' },
    { name: 'Reyes', filter: 'sepia(0.22) brightness(1.1) contrast(0.85)' },
    { name: 'Juno', filter: 'contrast(1.2) brightness(1.1) saturate(1.4)' },
    { name: 'Slumber', filter: 'saturate(0.66) brightness(1.05)' },
    { name: 'Crema', filter: 'sepia(0.5) contrast(1.25) brightness(1.15) saturate(0.9)' },
    { name: 'Ludwig', filter: 'contrast(1.05) brightness(1.05) saturate(2)' },
];

export const MAX_FILE_SIZE = {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
};

export const ACCEPTED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
};

export const REELS_PAGE_SIZE = 10;
export const COMMENTS_PAGE_SIZE = 5;