import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class UpdateProfileInput {
    @IsNotEmpty()
    @IsString()
    password: string
    @IsNotEmpty()
    @IsString()
    id: string 
}


export class UpdateProfileDto {
    @ValidateNested()
    @Type(()=>UpdateProfileInput)
    input: UpdateProfileInput
}

