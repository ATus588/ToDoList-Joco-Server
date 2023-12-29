import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RtkStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'rtk-secret',
            passReqToCallback: true
        })
    }

    validate(req: Request, payload: any) {
        
        const refreshTokens = req.headers.get('authorization').replace('Bearer', '').trim();
        return payload;
    }
}
