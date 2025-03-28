import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/users/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<Users> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(
    username: string,
    password: string,
  ): Promise<{
    access_token: string;
  }> {
    const validatedUser = await this.validateUser(username, password);
    console.log('🚀 ~ AuthService ~ login ~ validatedUser:', validatedUser);
    const payload = {
      userId: validatedUser.id,
      tenantId: validatedUser.tenantId,
      role: validatedUser.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
