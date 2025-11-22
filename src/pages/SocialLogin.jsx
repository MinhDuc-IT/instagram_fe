import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { checkTokenLogin } from '../service/authService';
import { loginSuccess } from '../redux/features/auth/authSlice';

export default function SocialLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userId, tokenLogin } = useParams();

    useEffect(() => {
        console.log('SocialLogin params:', { userId, tokenLogin });

        if (userId && tokenLogin) {
            checkTokenLogin(Number(userId), tokenLogin)
                .then((res) => {
                     dispatch(loginSuccess(res));
                    navigate('/home');
                })
                .catch((err) => {
                    console.error('Invalid token login', err);
                    navigate('/login');
                });
        } else {
            navigate('/login');
        }
    }, [userId, tokenLogin]);

    return <div></div>;
}
