import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateOrCreateUser(user: CreateUserDto) {
    const existingUser = await this.usersService.findByGithubId(user.githubId);
    if (existingUser) {
      return existingUser;
    }
    return this.usersService.create(user);
  }

  generateToken(user: JwtPayload) {
    const payload = {
      id: user.id,
      githubId: user.githubId,
      name: user.name,
    };

    return this.jwtService.sign(payload);
  }
}
