import axios from "../utils/axiosCustomize";

const registerNewUser = (userData: {
    email: string;
    password: string;
    fullName: string;
    username: string;
}) => {
    // const formData = new FormData();

    // formData.append('email', userData.email);
    // formData.append('password', userData.password);
    // formData.append('fullName', userData.fullName);
    // formData.append('username', userData.username);

    return axios.post('/auth/register', userData);
};

const verifyEmail = (token: string) => {
    return axios.post('/auth/verify', { token });
}

export { registerNewUser, verifyEmail };