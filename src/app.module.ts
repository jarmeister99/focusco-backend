import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppGateway } from './app.gateway';
import { AuthController } from './controllersv2/auth.controller';
import { CohortsController } from './controllersv2/cohorts.controller';
import { MessagesController } from './controllersv2/messages.controller';
import { ThreadsController } from './controllersv2/threads.controller';
import { UsersController } from './controllersv2/users.controller';
import { AuthService } from './servicesv2/auth.service';
import { CohortsService } from './servicesv2/cohorts.service';
import { MessagesService } from './servicesv2/messages.service';
import { PrismaService } from './servicesv2/prisma.service';
import { ThreadsService } from './servicesv2/threads.service';
import { TwilioService } from './servicesv2/twilio.service';
import { UsersService } from './servicesv2/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the configuration global
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    UsersController,
    MessagesController,
    ThreadsController,
    AuthController,
    CohortsController

  ],
  providers: [
    ConfigService,
    PrismaService,
    UsersService,
    MessagesService,
    ThreadsService,
    TwilioService,
    AuthService,
    AppGateway,
    CohortsService
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
  }
}
