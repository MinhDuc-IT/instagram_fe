import React from 'react';
import { ChevronLeft, Grid3x3 } from 'lucide-react';
import { MediaFile } from '../../types/media.types';
import { FILTERS } from '../../constants/filters';

interface MediaPreviewProps {
    currentMedia: MediaFile;
    mediaFiles: MediaFile[];
    currentIndex: number;
    onNavigate: (index: number) => void;
    fileInputRef?: React.RefObject<HTMLInputElement | null>;
    onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showAddButton?: boolean;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
    currentMedia,
    mediaFiles,
    currentIndex,
    onNavigate,
    fileInputRef,
    onFileSelect,
    showAddButton = true,
}) => {
    return (
        <div className="flex-1 bg-white flex items-center justify-center relative border-r">
            {currentMedia && (
                <>
                    <div className="w-full h-full flex items-center justify-center">
                        {currentMedia.type === 'image' ? (
                            <img
                                src={currentMedia.preview}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                                style={{
                                    filter: FILTERS[currentMedia.selectedFilter || 0].filter,
                                }}
                            />
                        ) : (
                            <video
                                src={currentMedia.preview}
                                controls
                                className="max-w-full max-h-full"
                                style={{
                                    filter: FILTERS[currentMedia.selectedFilter || 0].filter,
                                }}
                            />
                        )}
                    </div>

                    {mediaFiles.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {mediaFiles.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${idx === currentIndex
                                            ? 'bg-white'
                                            : 'bg-white bg-opacity-50'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {mediaFiles.length > 1 && (
                        <>
                            {currentIndex > 0 && (
                                <button
                                    onClick={() => onNavigate(currentIndex - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            {currentIndex < mediaFiles.length - 1 && (
                                <button
                                    onClick={() => onNavigate(currentIndex + 1)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center rotate-180"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                        </>
                    )}

                    {showAddButton && fileInputRef && onFileSelect && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 flex items-center justify-center text-white"
                        >
                            <Grid3x3 size={20} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default MediaPreview;