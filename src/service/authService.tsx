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
export const registerNewUser = (userData: RegisterUserDTO): Promise<AxiosResponse<any>> => {
    return axios.post("/auth/register", userData);
};

export const loginUser = (loginUserDTO: LoginUserDTO): Promise<AxiosResponse<LoginResponse>> => {
    return axios.post<LoginResponse>("/auth/login", loginUserDTO);
};

export const logoutUser = (): Promise<AxiosResponse<void>> => {
    return axios.post("/auth/logout");
};

export const verifyEmail = (token: string): Promise<AxiosResponse<any>> => {
    return axios.post("/auth/verify", { token });
};
