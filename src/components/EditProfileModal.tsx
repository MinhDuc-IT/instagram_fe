import { useState, ChangeEvent, FormEvent } from "react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { updateProfileRequest } from "../redux/features/user/userSlice";
import UploadService from "../service/uploadService";

interface Props {
    user: any;
    onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();

    console.log("Editing profile for user:", user);
    const [form, setForm] = useState({
        fullName: user.fullName || "",
        phone: user.phone || "",
        gender: user.gender ?? 0,
        avatar: user.avatar || "",
    });

    const [uploading, setUploading] = useState(false);

    const handleUploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const res = await UploadService.uploadImage(file);
            console.log("Upload response:", res);
            setForm((prev) => ({
                ...prev,
                avatar: res.url, // UploadService trả về UploadResponse
            }));
        } catch (error) {
            console.error("Upload failed", error);
        }

        setUploading(false);
    };


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        dispatch(
            updateProfileRequest({
                fullName: form.fullName,
                phone: form.phone,
                gender: form.gender,
                avatar: form.avatar,
            })
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                    <h2 className="text-lg font-bold">Edit Profile</h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="space-y-4 p-4">

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src={form.avatar || "/placeholder.svg"}
                            className="w-24 h-24 rounded-full object-cover"
                        />

                        <label className="cursor-pointer px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                            {uploading ? "Uploading..." : "Change Avatar"}
                            <input type="file" hidden onChange={handleUploadAvatar} />
                        </label>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Full Name</label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Phone</label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Gender</label>
                        <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
                            className="input-field"
                        >
                            <option value={0}>Not set</option>
                            <option value={1}>Male</option>
                            <option value={2}>Female</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button className="btn-primary w-full" type="submit">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
