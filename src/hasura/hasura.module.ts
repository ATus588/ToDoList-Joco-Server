import { Global, Module } from '@nestjs/common';
import { HasuraService } from './hasura.service';

@Global()
@Module({
  providers: [HasuraService],
  exports: [HasuraService]
})
export class HasuraModule {}
