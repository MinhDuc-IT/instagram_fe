import axios from 'axios';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import { store } from '../redux/store';
// import { UpdateAccessTokenSuccess, UserLogoutSuccess, OpenLoginModal } from '../redux/action/userAction';

const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

// Cấu hình để sử dụng cookie trong request
instance.defaults.withCredentials = true;

// Tạo biến để theo dõi việc refresh token (tránh lặp lại nhiều request refresh cùng lúc)
let isRefreshing = false;
let refreshSubscribers = [];

// Hàm để thực hiện khi đã refresh token xong
const onRefreshed = (newToken) => {
    refreshSubscribers.map((callback) => callback(newToken));
    refreshSubscribers = [];
};

// Hàm để thêm các request vào hàng đợi chờ refresh token
const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
};

// Thêm request interceptor
instance.interceptors.request.use(
    function (config) {
        const access_token = store?.getState()?.auth?.accessToken;
        if (access_token) {
            config.headers['Authorization'] = `Bearer ${access_token}`;
        }
        NProgress.start();
        return config;
    },
    function (error) {
        NProgress.done();
        return Promise.reject(error);
    },
);

// Thêm response interceptor để kiểm tra và lấy refresh token khi access_token hết hạn
instance.interceptors.response.use(
    function (response) {
        NProgress.done();
        console.log('Response:', response);
        return response && response.data ? response.data : response;
    },
    // async function (error) {
    //     NProgress.done();
    //     const { config, response } = error;
    //     const originalRequest = config;

    //     // Kiểm tra nếu lỗi trả về là 401 (Unauthorized) và lỗi này không phải là lỗi của refresh token
    //     if (response && response.status === 401 && !originalRequest._retry) {
    //         if (!isRefreshing) {
    //             // Đánh dấu rằng đang thực hiện refresh token
    //             isRefreshing = true;

    //             try {
    //                 // const refresh_token = store?.getState()?.user?.account?.refresh_token;
    //                 // Gửi request lấy access token mới bằng refresh token
    //                 // const res = await axios.post(
    //                 //     `${process.env.REACT_APP_BASE_URL}customer/refresh_token`,
    //                 //     {
    //                 //         refresh_token: refresh_token,
    //                 //     },
    //                 //     {
    //                 //         withCredentials: true,
    //                 //     },
    //                 // );
    //                 // if (res && res.data.DT) {
    //                 //     const newAccessToken = res.data.DT.access_token;
    //                 //     // Cập nhật access token mới vào redux store
    //                 //     // store.dispatch(UpdateAccessTokenSuccess(newAccessToken));
    //                 //     // Cập nhật lại Authorization header cho các request đã được thực hiện trước đó
    //                 //     originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    //                 //     // Thực hiện lại các request đang chờ đợi refresh token xong
    //                 //     onRefreshed(newAccessToken);
    //                 //     isRefreshing = false;

    //                 //     // Gửi lại request trước đó với access token mới
    //                 //     return instance(originalRequest);
    //                 // }
    //                 // if (res && res.data.EC !== 0) {
    //                 //     // store.dispatch(UserLogoutSuccess());
    //                 //     // store.dispatch(OpenLoginModal(true));    
    //                 // }
    //             } catch (err) {
    //                 isRefreshing = false;
    //                 console.log('Unable to refresh token', err);
    //                 return Promise.reject(err);
    //             }
    //         }

    //     // Chờ đợi refresh token hoàn thành và thực hiện lại request với access token mới
    //         const retryOriginalRequest = new Promise((resolve) => {
    //             addRefreshSubscriber((newToken) => {
    //                 originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
    //                 resolve(instance(originalRequest));
    //             });
    //         });

    //         return retryOriginalRequest;
    //     }

    //     // Nếu lỗi không phải 401 hoặc là lỗi của refresh token, trả về lỗi như bình thường
    //     return response && response.data ? response.data : Promise.reject(error);
    // },
    async function (error) {
        NProgress.done();
        const { config, response } = error;
        const originalRequest = config;

        // 🔥 Nếu lỗi không có response (mất mạng chẳng hạn)
        if (!response) {
            return Promise.reject(error);
        }

        // ❌ Nếu là gọi API login hoặc refresh mà bị 401 → không xử lý refresh token
        const isAuthEndpoint =
            originalRequest.url.includes('/auth/login') ||
            originalRequest.url.includes('/auth/logout') ||
            originalRequest.url.includes('/auth/refresh');

        if (response.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Lấy refresh_token (ví dụ từ cookie hoặc localStorage)
                    // const refresh_token = store.getState().auth.refresh_token;
                    // const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh`, { refresh_token }, { withCredentials: true });

                    // Giả sử BE trả về token mới:
                    // const newToken = res.data.access_token;

                    // Gắn lại token mới vào header
                    // store.dispatch(updateAccessToken(newToken));
                    // originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                    // Gọi lại những request đang chờ
                    onRefreshed(/*newToken*/);
                    isRefreshing = false;

                    // Retry lại request cũ
                    return instance(originalRequest);
                } catch (err) {
                    isRefreshing = false;
                    console.log('Refresh token failed:', err);
                    return Promise.reject(err);
                }
            }

            // Nếu đang trong lúc refresh → cho các request khác đợi
            const retryOriginalRequest = new Promise((resolve) => {
                addRefreshSubscriber((newToken) => {
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    resolve(instance(originalRequest));
                });
            });

            return retryOriginalRequest;
        }

        // 🧠 Nếu là 401 do login sai hoặc refresh sai → reject về saga
        // return Promise.reject(error);
        return response && response.data ? response.data : Promise.reject(error);
    }
);

export default instance;
