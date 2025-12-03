import axios from "../utils/axiosCustomize";
import { AxiosResponse } from "axios";
import { LoginResponse } from "../redux/features/auth/authSlice";

// Input DTOs
export interface RegisterUserDTO {
    email: string;
    password: string;
    fullName: string;
    username: string;
}

export interface LoginUserDTO {
    credential: string;
    password: string;
}

// API calls
const registerNewUser = (userData: RegisterUserDTO): Promise<AxiosResponse<any>> => {
    return axios.post("/auth/register", userData);
};

const loginUser = (loginUserDTO: LoginUserDTO): Promise<AxiosResponse<LoginResponse>> => {
    return axios.post<LoginResponse>("/auth/login", loginUserDTO);
};

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
