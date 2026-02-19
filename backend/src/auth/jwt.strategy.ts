/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    console.log('JWT_SECRET carregado:', secret ? 'SIM' : 'NÃO');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret ?? 'fallback_secret',
    });
  }

  validate(payload: { sub: string; email: string; name: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
