import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

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

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks());

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
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve chamar login ao submeter', async () => {
    mockLogin.mockResolvedValue({ user: {}, token: 'token' });
    renderLoginPage();

    await userEvent.type(
      screen.getByPlaceholderText('seu@email.com'),
      'joao@email.com',
    );
    await userEvent.type(
      screen.getByPlaceholderText('••••••'),
      'senha123',
    );
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('joao@email.com', 'senha123');
    });
  });

  it('deve exibir erro quando login falha', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
    renderLoginPage();

    await userEvent.type(
      screen.getByPlaceholderText('seu@email.com'),
      'errado@email.com',
    );
    await userEvent.type(
      screen.getByPlaceholderText('••••••'),
      'senhaerrada',
    );
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });
});