import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { X, Loader } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { fetchProfileUserRequest, updateProfileRequest } from "../redux/features/user/userSlice";
import UploadService from "../service/uploadService";
import { User } from "../types/user.type";

interface Props {
    user: User;
    onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        phone: "",
        gender: 0,
        avatar: "",
    });

    useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName || "",
                username: user.username || "",
                phone: user.phone || "",
                gender: user.gender ?? 0,
                avatar: user.avatar || "",
            });
        }
    }, [user]);

    const [uploading, setUploading] = useState(false);

    const handleUploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const res = await UploadService.uploadImage(file);
            setForm((prev) => ({
                ...prev,
                avatar: res.url,
            }));
        } catch (error) {
            console.error("Upload failed", error);
        }

        setUploading(false);
    };


    const [error, setError] = useState("");

    const validatePhone = (phone: string) => {
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (form.phone && !validatePhone(form.phone)) {
            setError("Số điện thoại không hợp lệ (VD: 0912345678)");
            return;
        }

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
        <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-[700px] rounded-xl overflow-hidden shadow-xl border dark:border-zinc-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold">Edit profile</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto flex-1 p-8">
                    <div className="flex flex-col gap-8">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-8 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                            <div className="relative">
                                <img
                                    src={form.avatar || "/placeholder.svg"}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-zinc-700"
                                />
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                        <Loader className="w-6 h-6 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{user.username}</h3>
                                <label className="text-sm font-semibold text-blue-500 hover:text-blue-600 cursor-pointer transition-colors">
                                    Change profile photo
                                    <input type="file" hidden onChange={handleUploadAvatar} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                            {error && (
                                <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {/* Full Name */}
                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-2 md:gap-4 items-center">
                                <label className="font-semibold">Full Name</label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    placeholder="Full Name"
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
                                />
                            </div>

                            {/* Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-2 md:gap-4 items-center">
                                <label className="font-semibold">Phone</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Phone number"
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
                                />
                            </div>

                            {/* Gender */}
                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-2 md:gap-4 items-center">
                                <label className="font-semibold">Gender</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors appearance-none"
                                >
                                    <option value={0}>Không muốn tiết lộ</option>
                                    <option value={1}>Nam</option>
                                    <option value={2}>Nữ</option>
                                    <option value={3}>Khác</option>
                                </select>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                    <button
                        type="submit"
                        form="edit-profile-form"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
