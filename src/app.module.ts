import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrebModule } from './modules/BrebB/breb.module';
import { PassportModule } from './modules/passport/passport.module';
import passportConfig from './config/passport.config';
import { validationSchema } from './config/app.config-validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [passportConfig],
      validationSchema,
    }),
    BrebModule,
    PassportModule,
  ],
})
export class AppModule {}
