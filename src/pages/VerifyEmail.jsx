import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../service/authService';
import { Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Thiếu token xác thực.');
            return;
        }

        let canceled = false;
        (async () => {
            setStatus('verifying');
            const start = Date.now();
            let nextStatus = 'success';
            let nextMessage = '';

            try {
                const res = await verifyEmail(token);
                if (res?.statusCode === 404) {
                    nextStatus = 'error';
                    nextMessage = res?.message || 'Xác thực thất bại.';
                }
            } catch (e) {
                nextStatus = 'error';
                nextMessage = e?.message || 'Xác thực thất bại.';
            }

            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 3000 - elapsed);
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }

            if (canceled) return;

            if (nextStatus === 'success') {
                setStatus('success');
                toast.success('Xác thực email thành công!');
                setTimeout(() => navigate('/login'), 1000);
            } else {
                setStatus('error');
                setMessage(nextMessage);
            }
        })();

        return () => {
            canceled = true;
        };
    }, [token, navigate]);

    const handleResend = async () => {
        if (!email) {
            toast.error('Vui lòng nhập email đã đăng ký để gửi lại.');
            setStatus('error');
            return;
        }
        setResending(true);
        try {
            const res = await resendVerification(email);
            console.log('Resend verification response:', res);
            if (res?.statusCode !== 200) {
                setStatus('error');
                toast.error(res?.message || 'Gửi lại email thất bại.');
                return;
            }
            setStatus('success');
            toast.success(res?.message || 'Đã gửi lại email xác thực.');
        } catch (err) {
            setStatus('error');
            toast.error(err?.message || 'Gửi lại email thất bại.');
        } finally {
            setResending(false);
        }
    };

    const showResend = !token || status === 'error';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-white px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-6 text-center space-y-4">
                <h2 className="text-2xl font-semibold">Xác thực email</h2>

                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <Loader className="w-10 h-10 animate-spin text-black-600" />
                        <p className="text-sm text-gray-600">Đang xác thực email...</p>
                    </div>
                )}

                {showResend && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Nhập email để nhận lại link xác thực</p>
                        <div className="space-y-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {resending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                            </button>
                        </div>
                        {message && <p className="text-sm text-red-600">{message}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
