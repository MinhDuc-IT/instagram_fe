import { useState } from "react"

interface Props {
    onClose: () => void
    onSubmit: (file: File) => void
}

export default function AddStoryModal({ onClose, onSubmit }: Props) {
    const [file, setFile] = useState<File | null>(null)

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-white w-[400px] rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Create story</h2>

                {!file ? (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center cursor-pointer">
                        <input
                            type="file"
                            accept="image/*,video/*"
                            hidden
                            onChange={e => e.target.files && setFile(e.target.files[0])}
                        />
                        <span className="text-gray-500">Select image or video</span>
                    </label>
                ) : (
                    <div className="space-y-3">
                        {file.type.startsWith("image") && (
                            <img
                                src={URL.createObjectURL(file)}
                                className="w-full rounded"
                            />
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 text-sm"
                                onClick={() => setFile(null)}
                            >
                                Change
                            </button>
                            <button
                                className="px-4 py-2 bg-black text-white rounded"
                                onClick={() => onSubmit(file)}
                            >
                                Share
                            </button>
                        </div>
                    </div>
                )}

                <button
                    className="absolute top-4 right-4 text-gray-500"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
