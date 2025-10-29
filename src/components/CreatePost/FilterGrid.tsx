import React from 'react';
import { Film } from 'lucide-react';
import { MediaFile } from '../../types/media.types';
import { FILTERS } from '../../constants/filters';

interface FilterGridProps {
    currentMedia: MediaFile;
    currentIndex: number;
    mediaFiles: MediaFile[];
    setMediaFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>;
}

const FilterGrid: React.FC<FilterGridProps> = ({
    currentMedia,
    currentIndex,
    mediaFiles,
    setMediaFiles,
}) => {
    const selectedFilter = currentMedia?.selectedFilter || 0;

    const handleFilterSelect = (filterIdx: number) => {
        const updatedFiles = mediaFiles.map((media, idx) =>
            idx === currentIndex ? { ...media, selectedFilter: filterIdx } : media
        );
        setMediaFiles(updatedFiles);
    };

    return (
        <div className="w-80 border-l overflow-y-auto">
            <div className="p-4">
                <h3 className="font-semibold mb-4">Filters</h3>
                <div className="grid grid-cols-3 gap-2">
                    {FILTERS.map((filter, idx) => (
                        <button
                            key={filter.name}
                            onClick={() => handleFilterSelect(idx)}
                            className={`relative ${selectedFilter === idx ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            {currentMedia?.type === 'image' ? (
                                <img
                                    src={currentMedia.preview}
                                    alt={filter.name}
                                    className="w-full aspect-square object-cover rounded"
                                    style={{ filter: filter.filter }}
                                />
                            ) : (
                                <div className="w-full aspect-square bg-gray-800 rounded flex items-center justify-center">
                                    <Film size={24} className="text-white" />
                                </div>
                            )}
                            <div className="text-xs text-center mt-1 font-medium">
                                {filter.name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterGrid;