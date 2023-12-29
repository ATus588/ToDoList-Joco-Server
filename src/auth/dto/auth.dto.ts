import { IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class SignInInput {
    @IsNotEmpty()
    @IsEmail()
    mail: string

    @IsNotEmpty()
    @IsString()
    password: string
}

export class SignUpInput {
    @IsNotEmpty()
    @IsEmail()
    mail: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsString()
    user_name: string
}

export class SignInDto {
    @ValidateNested()
    @Type(()=>SignInInput)
    input: SignInInput
}

export class SignUpDto {
    @ValidateNested()
    @Type(()=>SignUpInput)
    input: SignUpInput
}
