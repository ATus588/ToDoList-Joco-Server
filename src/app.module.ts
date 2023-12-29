import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HasuraModule } from './hasura/hasura.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [AuthModule, HasuraModule, ConfigModule.forRoot({isGlobal: true}), ProfileModule],
})
export class AppModule {}
