import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const user = await this.usersService.create(name, email, password);

    const token = this.generateToken(String(user._id), user.email, user.name);

    return {
      user: { id: String(user._id), name: user.name, email: user.email },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.generateToken(String(user._id), user.email, user.name);

    return {
      user: { id: String(user._id), name: user.name, email: user.email },
      token,
    };
  }

  private generateToken(userId: string, email: string, name: string): string {
    const payload = { sub: userId, email, name };
    return this.jwtService.sign(payload);
  }
}
