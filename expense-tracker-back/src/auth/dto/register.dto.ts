import { IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'Username can only contain Latin letters, numbers, dots and underscores',
  })
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
