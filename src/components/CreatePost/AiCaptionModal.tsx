import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { AiCaptionService, GenerateCaptionRequest, CaptionVariant } from '../../service/aiCaptionService';
import { MediaFile } from '../../types/media.types';

interface AiCaptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (caption: string) => void;
    currentMedia?: MediaFile;
    mediaFiles?: MediaFile[];
}

const AiCaptionModal: React.FC<AiCaptionModalProps> = ({ isOpen, onClose, onApply, currentMedia, mediaFiles }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CaptionVariant[] | null>(null);
    const [formData, setFormData] = useState<GenerateCaptionRequest>({
        userDescription: '',
        language: 'vi',
        intent: 'branding',
        tone: 'natural',
        brandStyle: '',
        maxVariants: 3
    });

    if (!isOpen) return null;

    const handleGenerateWithAi = async () => {
        setLoading(true);
        setResult(null);
        try {
            toast.info('AI đang phân tích và tạo caption...');

            let payload: GenerateCaptionRequest | FormData;

            if (mediaFiles && mediaFiles.length > 0) {
                const data = new FormData();
                mediaFiles.forEach((media) => {
                    if (media.file) {
                        data.append('images', media.file);
                    }
                });
                data.append('userDescription', formData.userDescription || 'Analyze these images and create a caption');
                data.append('language', formData.language || 'vi');
                data.append('intent', formData.intent || 'branding');
                data.append('tone', formData.tone || 'natural');
                data.append('maxVariants', String(formData.maxVariants || 3));
                if (formData.brandStyle) data.append('brandStyle', formData.brandStyle);
                payload = data;
            } else if (currentMedia?.file) {
                const data = new FormData();
                data.append('images', currentMedia.file);
                data.append('userDescription', formData.userDescription || 'Analyze this image and create a caption');
                data.append('language', formData.language || 'vi');
                data.append('intent', formData.intent || 'branding');
                data.append('tone', formData.tone || 'natural');
                data.append('maxVariants', String(formData.maxVariants || 3));
                if (formData.brandStyle) data.append('brandStyle', formData.brandStyle);
                payload = data;
            } else {
                if (!formData.userDescription.trim()) {
                    toast.warn('Vui lòng nhập mô tả hoặc chọn ảnh');
                    setLoading(false);
                    return;
                }
                payload = formData;
            }

            const response = await AiCaptionService.generate(payload);

            if (!response || !response.captions || (response as any).statusCode >= 400) {
                throw new Error((response as any).message || 'AI không thể tạo caption lúc này');
            }

            setResult(response.captions);
            toast.success('Đã tạo caption thành công!');
        } catch (error: any) {
            console.error('AI Caption generation failed:', error);
            toast.error(error.message || 'Dịch vụ bận, vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#262626] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Sparkles size={18} />
                        </div>
                        <h2 className="font-bold text-lg">Tạo caption bằng AI</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    {/* User Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Bài viết của bạn nói về điều gì?
                        </label>
                        <textarea
                            className="w-full h-24 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm transition-all"
                            placeholder="VD: Một buổi chiều yên tĩnh bên cửa sổ với ánh nắng nhẹ..."
                            value={formData.userDescription}
                            onChange={(e) => setFormData({ ...formData, userDescription: e.target.value })}
                        />
                    </div>

                    {/* Preferences Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ngôn ngữ</label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-sm outline-none"
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                            >
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">Tiếng Anh</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mục tiêu</label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-sm outline-none"
                                value={formData.intent}
                                onChange={(e) => setFormData({ ...formData, intent: e.target.value as any })}
                            >
                                <option value="branding">Thương hiệu</option>
                                <option value="sell">Bán hàng</option>
                                <option value="viral">Lan tỏa</option>
                                <option value="story">Kể chuyện</option>
                                <option value="reviews">Đánh giá</option>
                                <option value="promotion">Khuyến mãi</option>
                                <option value="education">Kiến thức</option>
                                <option value="inspiration">Cảm hứng</option>
                                <option value="tips">Mẹo vặt</option>
                                <option value="quotes">Trích dẫn</option>
                                <option value="humor">Hài hước</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phong cách</label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-sm outline-none"
                                value={formData.tone}
                                onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                            >
                                <option value="natural">Tự nhiên</option>
                                <option value="genz">Gen Z</option>
                                <option value="professional">Chuyên nghiệp</option>
                                <option value="emotional">Cảm xúc</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Thương hiệu</label>
                            <input
                                type="text"
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-sm outline-none"
                                placeholder="Không bắt buộc: Tối giản..."
                                value={formData.brandStyle}
                                onChange={(e) => setFormData({ ...formData, brandStyle: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateWithAi}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        {loading ? 'Đang xử lý...' : 'Tạo caption bằng AI'}
                    </button>

                    {/* Result Display */}
                    {result && result.length > 0 && (
                        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Gợi ý caption</span>
                                <span className="text-xs text-gray-400">{result.length} biến thể</span>
                            </div>

                            <div className="space-y-3">
                                {result.map((variant, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-xl border-2 border-purple-500/20 bg-purple-50/30 dark:bg-purple-900/5 hover:border-purple-500/50 transition-all group"
                                    >
                                        <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 italic mb-3">
                                            "{variant.text}"
                                        </p>
                                        <button
                                            onClick={() => {
                                                onApply(variant.text);
                                                onClose();
                                            }}
                                            className="w-full py-2 bg-white dark:bg-black border border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg font-semibold text-xs hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={14} />
                                            Sử dụng mẫu này
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiCaptionModal;
