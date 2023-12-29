import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class HasuraService {
    constructor(private configService: ConfigService) { }
    adminSecret = this.configService.get<string>("HASURA_ADMIN_SECRET")
    hasuraEndpoint = this.configService.get<string>("HASURA_ENDPOINT")

    async fetchGraphQL(
        operationsDoc: string,
        variables: Record<string, any>
    ) {
        
        const result = await axios.post(
            this.hasuraEndpoint,
            {
                query: operationsDoc,
                variables,
            },
            {
                headers: {'x-hasura-admin-secret': this.adminSecret}
            }
        );

        return await result.data;
    }

}
