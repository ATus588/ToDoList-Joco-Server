import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { Return } from './types';
import { HasuraService } from 'src/hasura/hasura.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from './dto';

const UPDATE_USER_BY_PK = `mutation MyMutation($id: Int!, $password: String!) {
    update_user_by_pk(pk_columns: {id: $id}, _set: {password: $password}) {
      id
      user_name
      password
      mail
      image
    }
  }
  `

@Injectable()
export class ProfileService {
    constructor(
        private hasuraService: HasuraService,
        private jwtService: JwtService
    ) {}

    async update(dto: UpdateProfileDto): Promise<Return> {
        const input = dto.input;
        const hashPassword = await this.hashData(input.password)
        const updatePw = await this.hasuraService.fetchGraphQL(UPDATE_USER_BY_PK, {
            id: parseInt(input.id),
            password: hashPassword
        })
        if(updatePw.error) {
            return { statusCode: 500, message: "Hasura Internal error" };
        }
        const token = await this.getToken(parseInt(input.id),updatePw.data.update_user_by_pk.mail, updatePw.data.update_user_by_pk.user_name);
        return {statusCode: 200, token: token}
    }

        //utils
        hashData(data: string) {
            return bcrypt.hash(data, 10)
        }
        async getToken(userId: number, mail: string, user_name: string): Promise<string> {
            const tk = await this.jwtService.signAsync({ sub: userId, mail, user_name }, { expiresIn: 60 * 60 * 24 * 7, secret: 'tk-secret' })
            return tk;
        }
}
