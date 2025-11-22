import axios from "../utils/axiosCustomize";

const registerNewUser = (userData: {
    email: string;
    password: string;
    fullName: string;
    username: string;
}) => {
    return axios.post('/auth/register', userData);
};

const loginUser = (loginUserDTO: { credential: string; password: string }) => {
    return axios.post('/auth/login', loginUserDTO);
}

const loginWithFacebook = () => {
    return axios.get('/auth/facebook');
};

const logoutUser = () => {
    return axios.post('/auth/logout');
}

const checkTokenLogin = (userId: number, tokenLogin: string) => {
    return axios.get(`/auth/checkTokenLogin?userId=${userId}&tokenLogin=${tokenLogin}`);
};

const verifyEmail = (token: string) => {
    return axios.post('/auth/verify', { token });
}

export { registerNewUser, verifyEmail, loginUser, logoutUser, loginWithFacebook, checkTokenLogin };