import React from 'react';
import { X, Film } from 'lucide-react';
import { MediaFile } from '../../types/media.types';

interface ThumbnailStripProps {
    mediaFiles: MediaFile[];
    currentIndex: number;
    onSelect: (index: number) => void;
    onRemove: (id: string) => void;
}

const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
    mediaFiles,
    currentIndex,
    onSelect,
    onRemove,
}) => {
    return (
        <div className="border-t p-2 flex gap-2 overflow-x-auto bg-gray-50">
            {mediaFiles.map((media, idx) => (
                <div key={media.id} className="relative flex-shrink-0">
                    <button
                        onClick={() => onSelect(idx)}
                        className={`w-16 h-16 rounded overflow-hidden ${currentIndex === idx ? 'ring-2 ring-blue-500' : ''
                            }`}
                    >
                        {media.type === 'image' ? (
                            <img
                                src={media.preview}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Film size={20} className="text-white" />
                            </div>
                        )}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(media.id);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-900"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ThumbnailStrip;