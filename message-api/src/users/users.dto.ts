import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum({
    user: 'user',
  })
  role: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;
}

export type UserDetails = {
  userId: string;
  tenantId: string;
  role: string;
};
