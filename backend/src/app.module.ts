import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { OccurrencesModule } from './modules/occurrences/occurrences.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OccurrencesModule,
    // CommentsModule, LikesModule, StorageModule, WeatherModule
  ],
  controllers: [AppController],
})
export class AppModule {}
