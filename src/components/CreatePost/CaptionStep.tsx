import React from 'react';
import { Smile, MapPin, ChevronDown } from 'lucide-react';
import MediaPreview from './MediaPreview';
import { MediaFile } from '../../types/media.types';

interface CaptionStepProps {
    currentMedia: MediaFile;
    mediaFiles: MediaFile[];
    currentIndex: number;
    caption: string;
    location: string;
    uploading: boolean;
    onNavigate: (index: number) => void;
    onCaptionChange: (caption: string) => void;
    onLocationChange: (location: string) => void;
}

const CaptionStep: React.FC<CaptionStepProps> = ({
    currentMedia,
    mediaFiles,
    currentIndex,
    caption,
    location,
    uploading,
    onNavigate,
    onCaptionChange,
    onLocationChange,
}) => {
    return (
        <>
            <MediaPreview
                currentMedia={currentMedia}
                mediaFiles={mediaFiles}
                currentIndex={currentIndex}
                onNavigate={onNavigate}
                showAddButton={false}
            />
            <div className="w-96 border-l flex flex-col">
                <div className="p-4 border-b flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    <span className="font-semibold text-sm">your_username</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    <textarea
                        value={caption}
                        onChange={(e) => onCaptionChange(e.target.value)}
                        placeholder="Write a caption..."
                        className="w-full h-32 resize-none outline-none text-sm"
                        maxLength={2200}
                        disabled={uploading}
                    />
                    <div className="text-xs text-gray-400 text-right mt-1">
                        {caption.length}/2,200
                    </div>

                    <button className="text-gray-400 hover:text-gray-600 mt-2">
                        <Smile size={20} />
                    </button>

                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-600" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => onLocationChange(e.target.value)}
                                placeholder="Add location"
                                className="flex-1 outline-none text-sm"
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <details className="cursor-pointer">
                            <summary className="flex items-center justify-between font-semibold text-sm">
                                Accessibility
                                <ChevronDown size={16} />
                            </summary>
                            <p className="text-xs text-gray-500 mt-2">
                                Alt text describes your photos for people with visual
                                impairments.
                            </p>
                        </details>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <details className="cursor-pointer">
                            <summary className="flex items-center justify-between font-semibold text-sm">
                                Advanced settings
                                <ChevronDown size={16} />
                            </summary>
                            <div className="text-xs text-gray-500 mt-2 space-y-2">
                                <label className="flex items-center justify-between">
                                    <span>Hide like and view counts</span>
                                    <input type="checkbox" className="rounded" />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span>Turn off commenting</span>
                                    <input type="checkbox" className="rounded" />
                                </label>
                            </div>
                        </details>
                    </div>

                    {uploading && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="font-semibold text-sm mb-2">Uploading...</h4>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full w-1/2 transition-all"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CaptionStep;