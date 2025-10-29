import React from 'react';

interface SelectMediaStepProps {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SelectMediaStep: React.FC<SelectMediaStepProps> = ({
    fileInputRef,
    onFileSelect,
}) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <svg
                className="w-24 h-24 mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
            </svg>
            <h3 className="text-xl text-gray-700 mb-4">
                Drag photos and videos here
            </h3>
            <label className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition">
                Select from computer
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={onFileSelect}
                    className="hidden"
                />
            </label>
        </div>
    );
};

export default SelectMediaStep;