import React from 'react';
import { MediaFile } from '../../types/media.types';

interface UploadProgressProps {
    mediaFiles: MediaFile[];
    uploadProgress: Record<string, number>;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
    mediaFiles,
    uploadProgress,
}) => {
    return (
        <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Uploading...</h4>
            {mediaFiles.map((media) => {
                const progress = uploadProgress[media.id] || 0;

                return (
                    <div key={media.id} className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="truncate flex-1">{media.file.name}</span>
                            <span className="ml-2">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        {media.error && (
                            <p className="text-red-500 text-xs mt-1">{media.error}</p>
                        )}
                        {media.uploadResponse && (
                            <p className="text-green-500 text-xs mt-1">✓ Uploaded</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default UploadProgress;