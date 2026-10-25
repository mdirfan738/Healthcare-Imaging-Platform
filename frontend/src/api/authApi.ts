import axiosClient from './axiosClient';
import { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: (payload: LoginRequest) => axiosClient.post<LoginResponse>('/auth/login', payload),
  refresh: (refreshToken: string) => axiosClient.post<LoginResponse>('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => axiosClient.post('/auth/logout', { refreshToken }),
};
