import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesController } from './controllersv2/messages.controller';
import { ThreadsController } from './controllersv2/threads.controller';
import { UsersController } from './controllersv2/users.controller';
import { MessagesService } from './servicesv2/messages.service';
import { PrismaService } from './servicesv2/prisma.service';
import { ThreadsService } from './servicesv2/threads.service';
import { UsersService } from './servicesv2/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the configuration global
    })
  ],
  controllers: [
    UsersController,
    MessagesController,
    ThreadsController
  ],
  providers: [
    ConfigService,
    PrismaService,
    UsersService,
    MessagesService,
    ThreadsService
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
  }
}
