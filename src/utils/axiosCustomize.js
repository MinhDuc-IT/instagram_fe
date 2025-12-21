import axios from 'axios';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import { store } from '../redux/store';
// import { UpdateAccessTokenSuccess, UserLogoutSuccess, OpenLoginModal } from '../redux/action/userAction';

const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

instance.defaults.withCredentials = true;

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
};

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
    }
);

instance.interceptors.response.use(
    function (response) {
        NProgress.done();
        return response && response.data ? response.data : response;
    },

    async function (error) {
        NProgress.done();
        const { config, response } = error;

        const originalRequest = config;
        if (!response) {
            return Promise.reject(error);
        }

        const isAuthEndpoint =
            originalRequest.url.includes('/auth/login') ||
            originalRequest.url.includes('/auth/logout') ||
            originalRequest.url.includes('/auth/refresh');

        // ❗ Nếu là 401 nhưng không phải login/refresh
        if (response.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // LẤY REFRESH TOKEN (tùy bạn lưu ở đâu)
                    const refreshToken = store.getState()?.auth?.refreshToken || localStorage.getItem("refresh_token");

                    console.log("🔁 Refresh token đang dùng:", refreshToken);

                    if (!refreshToken) {
                        console.log("❌ Không có refresh token → logout");
                        return Promise.reject(error);
                    }

                    // GỌI API REFRESH
                    const res = await axios.post(
                        `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
                        { refreshToken },
                        { withCredentials: true }
                    );

                    const newToken = res?.data?.accessToken;

                    if (!newToken) {
                        console.log("❌ Refresh API không trả access token");
                        return Promise.reject(error);
                    }

                    // 🔥 Cập nhật redux
                    store.dispatch({
                        type: "auth/updateAccessToken",
                        payload: newToken,
                    });

                    // Gắn lại Authorization
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                    // Đánh thức các request đang đợi
                    onRefreshed(newToken);

                    isRefreshing = false;

                    return instance(originalRequest);

                } catch (err) {
                    console.log('Refresh token failed:', err);

                    // 🔹 Dispatch logout redux
                    store.dispatch({type: "auth/logoutRequest"});
                    store.dispatch({type: "auth/logoutSuccess"});

                    // 🔹 Hiển thị thông báo
                    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

                    // 🔹 Reject promise
                    return Promise.reject(err);
                }
            }

            // Nếu đang refresh thì đợi
            return new Promise((resolve) => {
                addRefreshSubscriber((newToken) => {
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    resolve(instance(originalRequest));
                });
            });
        }

        // 🧠 Nếu là 401 do login sai hoặc refresh sai → reject về saga
        // return Promise.reject(error);
        return response && response.data ? response.data : Promise.reject(error);
    }
);

export default instance;
