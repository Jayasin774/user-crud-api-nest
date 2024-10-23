import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length, IsEmail, IsOptional, ValidateIf } from "class-validator";

export class CreateUserDto {
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  @Transform(({ value }) => value?.trim())
  password: string;
}


export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email?: string;

  @ValidateIf(o => !o.name && !o.email)
  @IsNotEmpty({ message: 'You can only update the email and name fields. At least one value must be provided.' })
  dummyField?: string;
}
export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}