import React from 'react';
import MediaPreview from './MediaPreview';
import FilterGrid from './FilterGrid';
import { MediaFile } from '../../types/media.types';

interface EditMediaStepProps {
    currentMedia: MediaFile;
    mediaFiles: MediaFile[];
    currentIndex: number;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNavigate: (index: number) => void;
    setMediaFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>;
}

const EditMediaStep: React.FC<EditMediaStepProps> = ({
    currentMedia,
    mediaFiles,
    currentIndex,
    fileInputRef,
    onFileSelect,
    onNavigate,
    setMediaFiles,
}) => {
    return (
        <>
            <MediaPreview
                currentMedia={currentMedia}
                mediaFiles={mediaFiles}
                currentIndex={currentIndex}
                onNavigate={onNavigate}
                fileInputRef={fileInputRef}
                onFileSelect={onFileSelect}
            />
            <FilterGrid
                currentMedia={currentMedia}
                currentIndex={currentIndex}
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
            />
        </>
    );
};

export default EditMediaStep;