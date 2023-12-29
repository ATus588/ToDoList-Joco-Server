import { Injectable } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { HasuraService } from 'src/hasura/hasura.service';
import * as bcrypt from 'bcrypt'
import { Tokens, Return } from './types';
import { JwtService } from '@nestjs/jwt';

const FIND_USER_BY_EMAIL_OPERATION = `
query MyQuery($mail: String!) {
    user(where: {mail: {_eq: $mail}}) {
      id
      image
      mail
      password
      user_name
      image
    }
  }
`
const INSERT_NEW_USER = `
mutation MyMutation($mail: String!, $password: String!, $user_name: String!) {
    insert_user_one(object: {mail: $mail, password: $password, user_name: $user_name}) {
      id
      user_name
    }
  }
`
const UPDATE_USER_REFRESH_TOKEN = `
mutation MyMutation2($id: Int!, $refreshToken: String!) {
    update_user_by_pk(pk_columns: {id: $id}, _set: {refreshToken: $refreshToken}) {
      id
      refreshToken
      user_name
    }
  }
`


@Injectable()
export class AuthService {
    constructor(
        private hasuraService: HasuraService,
        private jwtService: JwtService
    ) { }

    async signUp(dto: SignUpDto): Promise<Return> {
        const input = dto.input
        const result = await this.hasuraService.fetchGraphQL(FIND_USER_BY_EMAIL_OPERATION, {
            mail: input.mail
        })
        if (result.data.user[0]) {
            return { statusCode: 403, message: "This email is already taken" };
        }
        const hashPassword = await this.hashData(input.password)
        const insert = await this.hasuraService.fetchGraphQL(INSERT_NEW_USER, {
            mail: input.mail,
            password: hashPassword,
            user_name: input.user_name
        })
        if (insert.error) {
            return { statusCode: 500, message: "Hasura Internal error" }
        }
        const tokens = await this.getTokens(insert.data.insert_user_one.id, input.mail, input.user_name);
        const hashToken = await this.hashData(tokens.refreshToken);
        const updateToken = await this.hasuraService.fetchGraphQL(UPDATE_USER_REFRESH_TOKEN, {
            id: insert.data.insert_user_one.id,
            refreshToken: hashToken
        })
        if (updateToken.error) {
            return { statusCode: 500, message: "Hasura Internal error" }
        }
        return { statusCode: 200 };
    }

    async signIn(dto: SignInDto): Promise<Return> {
        const input = dto.input
        console.log(input)
        const result = await this.hasuraService.fetchGraphQL(FIND_USER_BY_EMAIL_OPERATION, {
            mail: input.mail
        })
        const user = result.data.user[0]
        if (!user) {
            return { statusCode: 401, message: "Wrong email or password" }
        }
        const check = await bcrypt.compare(input.password, user.password)
        if (!check) {
            return { statusCode: 401, message: "Wrong email or password" }
        }
        const tokens = await this.getTokens(user.id, input.mail, user.user_name);
        const hashToken = await this.hashData(tokens.refreshToken);
        const updateToken = await this.hasuraService.fetchGraphQL(UPDATE_USER_REFRESH_TOKEN, {
            id: user.id,
            refreshToken: hashToken
        })
        if (updateToken.error) {
            return { statusCode: 500, message: "Hasura Internal error" }
        }
        return { statusCode: 200, token: tokens.token, refreshToken: tokens.refreshToken, id: user.id, user_name: user.user_name, avatar: user.image };

    }

    logOut() { }

    refreshTokens() { }

    //utils
    hashData(data: string) {
        return bcrypt.hash(data, 10)
    }

    async getTokens(userId: number, mail: string, user_name): Promise<Tokens> {
        const [tk, rtk] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, mail, user_name }, { expiresIn: 60 * 60 * 24 * 7, secret: 'tk-secret' }),
            this.jwtService.signAsync({ sub: userId, mail, user_name }, { expiresIn: 60 * 60 * 24 * 7, secret: 'rtk-secret' })
        ])
        return { token: tk, refreshToken: rtk };
    }

}
