/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock do UsersService — versão falsa que você controla
// jest.fn() cria uma função que não faz nada mas você pode configurar o retorno
const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

// Mock do JwtService
const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================================
  // Testes do método register
  // =============================================
  describe('register', () => {
    it('deve retornar usuário e token ao registrar com sucesso', async () => {
      // Arrange — configura o cenário
      const mockUser = {
        _id: 'user-id-123',
        name: 'João Silva',
        email: 'joao@email.com',
      };

      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token-fake-123');

      // Act — executa o que está sendo testado
      const result = await authService.register(
        'João Silva',
        'joao@email.com',
        'senha123',
      );

      // Assert — verifica o resultado
      expect(result).toHaveProperty('token', 'token-fake-123');
      expect(result.user).toEqual({
        id: 'user-id-123',
        name: 'João Silva',
        email: 'joao@email.com',
      });
    });

    it('deve propagar erro quando UsersService lançar ConflictException', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email já cadastrado'),
      );

      await expect(
        authService.register('João', 'joao@email.com', 'senha123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // =============================================
  // Testes do método login
  // =============================================
  describe('login', () => {
    it('deve retornar usuário e token com credenciais corretas', async () => {
      const mockUser = {
        _id: 'user-id-123',
        name: 'João Silva',
        email: 'joao@email.com',
        password: '$2a$12$hashedpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token-fake-123');

      // Mock do bcrypt para não precisar de hash real no teste
      jest.mock('bcryptjs', () => ({
        compare: jest.fn().mockResolvedValue(true),
      }));

      const result = await authService.login('joao@email.com', 'senha123');

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('joao@email.com');
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('naoexiste@email.com', 'senha123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando senha está errada', async () => {
        const mockUser = {
            _id: 'id',
            name: 'João',
            email: 'joao@email.com',
            password: '$2a$12$hashedpassword',
        };

        mockUsersService.findByEmail.mockResolvedValue(mockUser);

        // bcrypt.compare vai retornar false porque o hash não bate com a senha
        // não precisa mockar — o bcrypt real vai comparar e retornar false naturalmente
        await expect(
                authService.login('joao@email.com', 'senhaerrada'),
            ).rejects.toThrow(UnauthorizedException);
        });
  });
});