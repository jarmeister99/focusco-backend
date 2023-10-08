import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsController } from './controllers/contacts/contacts.controller';
import { ExportMessagesController } from './controllers/export/messages.controller';
import { MessagesController } from './controllers/messages/messages.controller';
import { ThreadsController } from './controllers/threads/threads.controller';
import { ContactSchema } from './schema/contact.schema';
import { MessageSchema } from './schema/message.schema';
import { ThreadSchema } from './schema/thread.schema';
import { ContactsService } from './services/contacts/contacts.service';
import { MessagesService } from './services/messages/messages.service';
import { ThreadsService } from './services/threads/threads.service';
import { TwilioService } from './twilio/twilio.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the configuration global
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOSTNAME}/?retryWrites=true&w=majority`,
      { dbName: process.env.MONGO_DBNAME },
    ),
    MongooseModule.forFeature([
      { name: 'Contact', schema: ContactSchema },
      { name: 'Message', schema: MessageSchema },
      { name: 'Thread', schema: ThreadSchema },
    ]),
  ],
  controllers: [
    AppController,
    ContactsController,
    MessagesController,
    ThreadsController,
    ExportMessagesController
  ],
  providers: [
    AppService,
    ContactsService,
    MessagesService,
    ThreadsService,
    TwilioService,
    ConfigService,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
  }
}
