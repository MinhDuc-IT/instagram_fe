import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../service/authService';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('idle'); // idle | verifying | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Thiếu token xác thực.');
            return;
        }

        let canceled = false;
        (async () => {
            setStatus('verifying');
            try {
                const res = await verifyEmail(token);
                console.log("Verify email response:", res);
                if (res.statusCode !== 200) {
                    setMessage(res.message || 'Xác thực thất bại.');
                    setStatus('error');
                    return;
                }
                if (!canceled) {
                    setStatus('success');
                    setMessage('Xác thực email thành công. Chuyển đến trang đăng nhập...');
                }
            } catch (e) {
                if (!canceled) {
                    setStatus('error');
                    setMessage(e.message || 'Xác thực thất bại.');
                }
            }
        })();

        return () => { canceled = true; };
    }, [token, navigate]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Verify Email</h2>
            {status === 'verifying' && <p>Đang xác thực...</p>}
            {status !== 'verifying' && <p>{message}</p>}
        </div>
    );
};

export default VerifyEmail;