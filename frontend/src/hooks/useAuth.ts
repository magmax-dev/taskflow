import { useAppDispatch, useAppSelector } from '../store';
import {
  setCredentials,
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
} from '../store/slices/authSlice';

const API_URL = process.env.REACT_APP_API_URL;

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao criar conta');

    dispatch(setCredentials(data));
    return data;
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Credenciais inválidas');

    dispatch(setCredentials(data));
    return data;
  };

  const handleLogout = () => dispatch(logout());

  return { user, isAuthenticated, register, login, logout: handleLogout };
}