import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginPage } from './LoginPage';
import authReducer from '../../store/slices/authSlice';

// =============================================
// CONCEITO: Mock de módulos
// Substituímos o hook useAuth por uma versão
// controlada — assim o teste não faz fetch real
// =============================================
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Função auxiliar para renderizar com as dependências necessárias
function renderLoginPage() {
  const store = configureStore({
    reducer: { auth: authReducer },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </Provider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================================
  // Renderização inicial
  // =============================================
  describe('Renderização', () => {
    it('deve exibir o título TaskFlow', () => {
      renderLoginPage();
      expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    });

    it('deve exibir campos de email e senha', () => {
      renderLoginPage();
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument();
    });

    it('deve exibir botão de entrar', () => {
      renderLoginPage();
      expect(
        screen.getByRole('button', { name: /entrar/i }),
      ).toBeInTheDocument();
    });

    it('deve exibir link para criar conta', () => {
      renderLoginPage();
      expect(screen.getByText(/criar conta/i)).toBeInTheDocument();
    });
  });

  // =============================================
  // Interação do usuário
  // =============================================
  describe('Interação', () => {
    it('deve chamar login com email e senha corretos ao submeter', async () => {
      mockLogin.mockResolvedValue({ user: {}, token: 'token' });
      renderLoginPage();

      // userEvent simula interação real do usuário
      userEvent.type(
            screen.getByPlaceholderText('seu@email.com'),
            'joao@email.com'
        );
      userEvent.type(
            screen.getByPlaceholderText('••••••'),
            'senha123'
        );
      userEvent.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('joao@email.com', 'senha123');
      });
    });

    it('deve exibir mensagem de erro quando login falha', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
      renderLoginPage();

      userEvent.type(
            screen.getByPlaceholderText('seu@email.com'),
            'errado@email.com'
        );
      userEvent.type(
            screen.getByPlaceholderText('••••••'),
            'senhaerrada'
        );
      userEvent.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Credenciais inválidas'),
        ).toBeInTheDocument();
      });
    });

    it('deve desabilitar botão durante o loading', async () => {
      // Faz o login demorar para poder ver o estado de loading
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );
      renderLoginPage();

      userEvent.type(
            screen.getByPlaceholderText('seu@email.com'),
            'joao@email.com'
        );
      userEvent.type(
            screen.getByPlaceholderText('••••••'),
            'senha123'
        );
      userEvent.click(screen.getByRole('button', { name: /entrar/i }));

      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
    });
  });
});