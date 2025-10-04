import api from './base';

export interface RegisterUserData {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
  phone?: string;
  department?: string;
  employeeId?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

export const registerUser = (data: RegisterUserData) =>
  api.post<User>('/auth/register', data);
