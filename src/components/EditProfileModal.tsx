// import { useState, ChangeEvent, FormEvent, useEffect } from "react";
// import { X, Loader } from "lucide-react";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../redux/store";
// import { fetchProfileUserRequest, updateProfileRequest } from "../redux/features/user/userSlice";
// import UploadService from "../service/uploadService";
// import { User } from "../types/user.type";

// interface Props {
//     user: User;
//     onClose: () => void;
// }

// export default function EditProfileModal({ user, onClose }: Props) {
//     const dispatch = useDispatch<AppDispatch>();

//     const [form, setForm] = useState({
//         fullName: "",
//         username: "",
//         phone: "",
//         gender: 0,
//         avatar: "",
//         bio: "",
//         website: "",
//     });

//     useEffect(() => {
//         if (user) {
//             setForm({
//                 fullName: user.fullName || "",
//                 username: user.username || "",
//                 phone: user.phone || "",
//                 gender: user.gender ?? 0,
//                 avatar: user.avatar || "",
//                 bio: user.bio || "",
//                 website: user.website || "",
//             });
//         }
//     }, [user]);

//     const [uploading, setUploading] = useState(false);

//     const handleUploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         setUploading(true);

//         try {
//             const res = await UploadService.uploadImage(file);
//             setForm((prev) => ({
//                 ...prev,
//                 avatar: res.url,
//             }));
//         } catch (error) {
//             console.error("Upload failed", error);
//         }

//         setUploading(false);
//     };


//     const [error, setError] = useState("");

//     const validatePhone = (phone: string) => {
//         const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
//         return phoneRegex.test(phone);
//     };

//     const handleSubmit = (e: FormEvent) => {
//         e.preventDefault();
//         setError("");

//         if (form.phone && !validatePhone(form.phone)) {
//             setError("Số điện thoại không hợp lệ (VD: 0912345678)");
//             return;
//         }

//         dispatch(
//             updateProfileRequest({
//                 fullName: form.fullName,
//                 phone: form.phone,
//                 gender: form.gender,
//                 avatar: form.avatar,
//                 bio: form.bio,
//                 website: form.website,
//             })
//         );

//         onClose();
//     };

//     return (
//         <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-0 md:p-4">
//             <div className="bg-white dark:bg-[#262626] w-full max-w-[700px] md:rounded-xl overflow-hidden shadow-xl flex flex-col h-full md:h-auto md:max-h-[90vh]">

//                 {/* Header */}
//                 <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#363636]">
//                     <div className="w-8 md:hidden">
//                         <button onClick={onClose}>
//                             <X className="w-6 h-6" />
//                         </button>
//                     </div>
//                     <h2 className="text-[16px] font-bold md:text-xl md:font-semibold flex-1 text-center md:text-left">Edit profile</h2>
//                     <div className="w-8 hidden md:block">
//                         <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
//                             <X className="w-6 h-6" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Body - Scrollable */}
//                 <div className="overflow-y-auto flex-1 p-4 md:p-8">
//                     <div className="flex flex-col gap-8 max-w-2xl mx-auto">

//                         {/* Avatar Section */}
//                         <div className="flex items-center gap-4 md:gap-8 bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl">
//                             <div className="relative">
//                                 <img
//                                     src={form.avatar || "/placeholder.svg"}
//                                     alt="Profile"
//                                     className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border border-gray-200 dark:border-[#363636]"
//                                 />
//                                 {uploading && (
//                                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
//                                         <Loader className="w-4 h-4 md:w-6 md:h-6 animate-spin text-white" />
//                                     </div>
//                                 )}
//                             </div>
//                             <div className="flex flex-col">
//                                 <h3 className="font-bold text-[16px] leading-tight mb-1">{user.username}</h3>
//                                 <label className="text-sm font-bold text-[#0095f6] hover:text-[#1877f2] cursor-pointer transition-colors">
//                                     Change profile photo
//                                     <input type="file" hidden onChange={handleUploadAvatar} accept="image/*" />
//                                 </label>
//                             </div>
//                         </div>

//                         {/* Form Fields */}
//                         <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
//                             {error && (
//                                 <div className="bg-red-50 dark:bg-red-900/20 text-red-500 px-4 py-2 rounded-lg text-sm">
//                                     {error}
//                                 </div>
//                             )}

//                             {/* Full Name */}
//                             <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-start">
//                                 <label className="font-bold text-[16px] mb-2 md:mb-0 md:pt-2">Name</label>
//                                 <div className="space-y-2">
//                                     <input
//                                         type="text"
//                                         value={form.fullName}
//                                         onChange={(e) => setForm({ ...form, fullName: e.target.value })}
//                                         placeholder="Name"
//                                         className="w-full bg-white dark:bg-black border border-gray-200 dark:border-[#363636] rounded-lg px-3 py-2 text-[16px] focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
//                                     />
//                                     <p className="text-[12px] text-gray-500">Giúp mọi người dễ dàng tìm thấy tài khoản của bạn bằng cách sử dụng tên mà bạn được biết đến: có thể là tên đầy đủ, biệt danh hoặc tên doanh nghiệp.</p>
//                                 </div>
//                             </div>

//                             {/* Website */}
//                             <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-start">
//                                 <label className="font-bold text-[16px] mb-2 md:mb-0 md:pt-2">Website</label>
//                                 <div className="space-y-2">
//                                     <input
//                                         type="text"
//                                         value={form.website}
//                                         onChange={(e) => setForm({ ...form, website: e.target.value })}
//                                         placeholder="Website"
//                                         className="w-full bg-white dark:bg-black border border-gray-200 dark:border-[#363636] rounded-lg px-3 py-2 text-[16px] focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
//                                     />
//                                     <p className="text-[12px] text-gray-500">Editing your links is only available on mobile. Visit the Instagram app and edit your profile to change the websites in your bio.</p>
//                                 </div>
//                             </div>

//                             {/* Bio */}
//                             <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-start">
//                                 <label className="font-bold text-[16px] mb-2 md:mb-0 md:pt-2">Bio</label>
//                                 <div className="space-y-2">
//                                     <textarea
//                                         value={form.bio}
//                                         onChange={(e) => setForm({ ...form, bio: e.target.value })}
//                                         placeholder="Bio"
//                                         rows={3}
//                                         className="w-full bg-white dark:bg-black border border-gray-200 dark:border-[#363636] rounded-lg px-3 py-2 text-[16px] focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors resize-none"
//                                     />
//                                     <p className="text-[12px] text-gray-500">{form.bio.length} / 150</p>
//                                 </div>
//                             </div>

//                             {/* Phone */}
//                             <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-center">
//                                 <label className="font-bold text-[16px] mb-2 md:mb-0">Phone</label>
//                                 <input
//                                     type="text"
//                                     value={form.phone}
//                                     onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                                     placeholder="Phone number"
//                                     className="w-full bg-white dark:bg-black border border-gray-200 dark:border-[#363636] rounded-lg px-3 py-2 text-[16px] focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
//                                 />
//                             </div>

//                             {/* Gender */}
//                             <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-center">
//                                 <label className="font-bold text-[16px] mb-2 md:mb-0">Gender</label>
//                                 <select
//                                     value={form.gender}
//                                     onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
//                                     className="w-full bg-white dark:bg-black border border-gray-200 dark:border-[#363636] rounded-lg px-3 py-2 text-[16px] focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors appearance-none"
//                                 >
//                                     <option value={0}>Prefer not to say</option>
//                                     <option value={1}>Male</option>
//                                     <option value={2}>Female</option>
//                                     <option value={3}>Other</option>
//                                 </select>
//                             </div>
//                         </form>
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="p-4 border-t border-gray-100 dark:border-[#363636] flex justify-end">
//                     <button
//                         type="submit"
//                         form="edit-profile-form"
//                         className="bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm w-full md:w-auto"
//                     >
//                         Submit
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }


import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { X, Loader, Camera } from "lucide-react";
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
        bio: "",
        website: "",
    });

    useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName || "",
                username: user.username || "",
                phone: user.phone || "",
                gender: user.gender ?? 0,
                avatar: user.avatar || "",
                bio: user.bio || "",
                website: user.website || "",
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
                bio: form.bio,
                website: form.website,
            })
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#262626] w-full max-w-[700px] md:rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh] animate-in slide-in-from-bottom md:slide-in-from-bottom-4 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#363636] bg-gradient-to-b from-gray-50/50 to-transparent dark:from-[#1a1a1a]/50">
                    <div className="w-8 md:hidden">
                        <button
                            onClick={onClose}
                            className="hover:opacity-70 transition-opacity"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <h2 className="text-[18px] font-bold md:text-xl flex-1 text-center md:text-left">
                        Edit profile
                    </h2>
                    <div className="w-8 hidden md:block">
                        <button
                            onClick={onClose}
                            className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-[#363636] transition-all duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto flex-1 p-6 md:p-8">
                    <div className="flex flex-col gap-8 max-w-2xl mx-auto">

                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1a1a] dark:to-[#262626] p-6 rounded-2xl border border-gray-200 dark:border-[#363636] shadow-sm">
                            <div className="relative group">
                                <img
                                    src={form.avatar || "/placeholder.svg"}
                                    alt="Profile"
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white dark:border-[#363636] shadow-lg transition-transform group-hover:scale-105 duration-200"
                                />
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm">
                                        <Loader className="w-6 h-6 md:w-8 md:h-8 animate-spin text-white" />
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-[#0095f6] hover:bg-[#1877f2] p-2 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input type="file" hidden onChange={handleUploadAvatar} accept="image/*" />
                                </label>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-[18px] leading-tight mb-2">{user.username}</h3>
                                <label className="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] cursor-pointer transition-colors inline-flex items-center gap-1">
                                    Change profile photo
                                    <input type="file" hidden onChange={handleUploadAvatar} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-7">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 duration-200">
                                    {error}
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="flex flex-col md:grid md:grid-cols-[160px_1fr] md:gap-6 md:items-start">
                                <label className="font-semibold text-[15px] mb-2 md:mb-0 md:pt-3 text-gray-700 dark:text-gray-300">Name</label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                        placeholder="Enter your name"
                                        className="w-full bg-white dark:bg-[#121212] border-2 border-gray-200 dark:border-[#363636] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0095f6] dark:focus:border-[#0095f6] transition-all duration-200 placeholder:text-gray-400"
                                    />
                                    <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">Giúp mọi người dễ dàng tìm thấy tài khoản của bạn bằng cách sử dụng tên mà bạn được biết đến: có thể là tên đầy đủ, biệt danh hoặc tên doanh nghiệp.</p>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="flex flex-col md:grid md:grid-cols-[160px_1fr] md:gap-6 md:items-start">
                                <label className="font-semibold text-[15px] mb-2 md:mb-0 md:pt-3 text-gray-700 dark:text-gray-300">Website</label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={form.website}
                                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                                        placeholder="https://example.com"
                                        className="w-full bg-white dark:bg-[#121212] border-2 border-gray-200 dark:border-[#363636] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0095f6] dark:focus:border-[#0095f6] transition-all duration-200 placeholder:text-gray-400"
                                    />
                                    <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">Chỉnh sửa liên kết của bạn chỉ có thể được thực hiện trên điện thoại di động. Truy cập ứng dụng Instagram và chỉnh sửa hồ sơ của bạn để thay đổi các trang web trong bio của bạn.</p>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="flex flex-col md:grid md:grid-cols-[160px_1fr] md:gap-6 md:items-start">
                                <label className="font-semibold text-[15px] mb-2 md:mb-0 md:pt-3 text-gray-700 dark:text-gray-300">Bio</label>
                                <div className="space-y-2">
                                    <textarea
                                        value={form.bio}
                                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                        maxLength={150}
                                        className="w-full bg-white dark:bg-[#121212] border-2 border-gray-200 dark:border-[#363636] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0095f6] dark:focus:border-[#0095f6] transition-all duration-200 resize-none placeholder:text-gray-400"
                                    />
                                    <p className="text-[12px] text-gray-500 dark:text-gray-400">{form.bio.length} / 150</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col md:grid md:grid-cols-[160px_1fr] md:gap-6 md:items-center">
                                <label className="font-semibold text-[15px] mb-2 md:mb-0 text-gray-700 dark:text-gray-300">Phone</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="0912345678"
                                    className="w-full bg-white dark:bg-[#121212] border-2 border-gray-200 dark:border-[#363636] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0095f6] dark:focus:border-[#0095f6] transition-all duration-200 placeholder:text-gray-400"
                                />
                            </div>

                            {/* Gender */}
                            <div className="flex flex-col md:grid md:grid-cols-[160px_1fr] md:gap-6 md:items-center">
                                <label className="font-semibold text-[15px] mb-2 md:mb-0 text-gray-700 dark:text-gray-300">Gender</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
                                    className="w-full bg-white dark:bg-[#121212] border-2 border-gray-200 dark:border-[#363636] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0095f6] dark:focus:border-[#0095f6] transition-all duration-200 cursor-pointer"
                                >
                                    <option value={0}>Prefer not to say</option>
                                    <option value={1}>Male</option>
                                    <option value={2}>Female</option>
                                    <option value={3}>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-[#363636] flex justify-end bg-gradient-to-t from-gray-50/50 to-transparent dark:from-[#1a1a1a]/50">
                    <button
                        onClick={handleSubmit}
                        className="bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold px-8 py-2.5 rounded-xl transition-all duration-200 text-[15px] w-full md:w-auto shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}