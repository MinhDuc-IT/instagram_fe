import React, { useState, useRef } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import SelectMediaStep from './SelectMediaStep';
import EditMediaStep from './EditMediaStep';
import CaptionStep from './CaptionStep';
import ThumbnailStrip from './ThumbnailStrip';
import { MediaFile } from '../../types/media.types';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { usePostUpload } from '../../hooks/usePostUpload';

type Step = 'select' | 'edit' | 'caption';

interface CreatePostModalProps {
    open: boolean;
    onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ open, onClose }) => {
    const [step, setStep] = useState<Step>('select');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { uploading, uploadProgress, uploadMultiple } = useMediaUpload();
    const { uploading: postUploading, uploadProgress: postUploadProgress, uploadPost } = usePostUpload();

    if (!open) return null;

    const hasContent = mediaFiles.length > 0 || caption || location;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newFiles: MediaFile[] = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
            selectedFilter: 0,
        }));

        setMediaFiles(prev => [...prev, ...newFiles]);
        if (step === 'select' && newFiles.length > 0) {
            setStep('edit');
        }
    };

    const handleNext = () => {
        if (step === 'edit' && mediaFiles.length > 0) {
            setStep('caption');
        }
    };

    const handleBack = () => {
        if (step === 'caption') {
            setStep('edit');
        } else if (step === 'edit') {
            setMediaFiles([]);
            setCurrentIndex(0);
            setStep('select');
        }
    };

    const handleClose = () => {
        if (hasContent) {
            const confirmed = window.confirm(
                'Discard post?\n\nIf you leave, your edits won\'t be saved.'
            );
            if (!confirmed) return;
        }

        setStep('select');
        setMediaFiles([]);
        setCaption('');
        setLocation('');
        setCurrentIndex(0);
        onClose();
    };

    const handlePost = async () => {
        // const updatedFiles = mediaFiles.map((m) => ({ ...m, uploading: true }));
        // setMediaFiles(updatedFiles);

        // const results = await uploadMultiple(mediaFiles);
        // const finalFiles = mediaFiles.map((media, idx) => ({
        //     ...media,
        //     uploadResponse: results[idx],
        //     uploading: false,
        // }));
        // setMediaFiles(finalFiles);

        try {
            const result = await uploadPost(
                caption,
                location,
                'public',
                false,
                false,
                mediaFiles
            );

            console.log('✅ Post created:', result);
            alert('Post created successfully!');
            onClose();

            setStep('select');
            setMediaFiles([]);
            setCaption('');
            setLocation('');
            setCurrentIndex(0);
            onClose();
        } catch (error) {
            console.error('❌ Post creation failed:', error);
            alert('Failed to create post. Please try again.');
            return;
        }
    };

    const removeMedia = (id: string) => {
        setMediaFiles(prev => prev.filter(m => m.id !== id));
        if (currentIndex >= mediaFiles.length - 1) {
            setCurrentIndex(Math.max(0, mediaFiles.length - 2));
        }
        if (mediaFiles.length === 1) {
            setStep('select');
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const currentMedia = mediaFiles[currentIndex];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                    <button
                        onClick={step !== 'select' ? handleBack : handleClose}
                        className="text-gray-700 hover:text-gray-900 w-6"
                    >
                        {step !== 'select' ? <ChevronLeft size={22} /> : <X size={22} />}
                    </button>

                    <h2 className="font-semibold text-base text-gray-800">
                        {step === 'select' && 'Create new post'}
                        {step === 'edit' && 'Edit'}
                        {step === 'caption' && 'Create new post'}
                    </h2>

                    <button
                        onClick={() => {
                            if (step === 'edit') handleNext();
                            else if (step === 'caption') handlePost();
                        }}
                        className={`text-sm font-semibold transition-colors w-16 text-right ${(step === 'edit' && mediaFiles.length > 0) ||
                            (step === 'caption' && !uploading)
                            ? 'text-blue-500 hover:text-blue-600'
                            : 'text-gray-300'
                            }`}
                        disabled={step === 'select' || (step === 'caption' && uploading)}
                    >
                        {step === 'caption'
                            ? uploading
                                ? 'Posting...'
                                : 'Share'
                            : 'Next'}
                    </button>
                </div>

                <div className="flex h-[600px]">
                    {step === 'select' && (
                        <SelectMediaStep
                            fileInputRef={fileInputRef}
                            onFileSelect={handleFileSelect}
                        />
                    )}

                    {step === 'edit' && (
                        <EditMediaStep
                            currentMedia={currentMedia}
                            mediaFiles={mediaFiles}
                            currentIndex={currentIndex}
                            fileInputRef={fileInputRef}
                            onFileSelect={handleFileSelect}
                            onNavigate={setCurrentIndex}
                            setMediaFiles={setMediaFiles}
                        />
                    )}

                    {step === 'caption' && (
                        <CaptionStep
                            currentMedia={currentMedia}
                            mediaFiles={mediaFiles}
                            currentIndex={currentIndex}
                            caption={caption}
                            location={location}
                            uploading={uploading}
                            onNavigate={setCurrentIndex}
                            onCaptionChange={setCaption}
                            onLocationChange={setLocation}
                        />
                    )}
                </div>

                {mediaFiles.length > 1 && step !== 'select' && (
                    <ThumbnailStrip
                        mediaFiles={mediaFiles}
                        currentIndex={currentIndex}
                        onSelect={setCurrentIndex}
                        onRemove={removeMedia}
                    />
                )}
            </div>
        </div>
    );
};

export default CreatePostModal;