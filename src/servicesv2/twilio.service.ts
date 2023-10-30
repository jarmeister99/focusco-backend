// src/twilio/twilio.service.ts
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from '@prisma/client';
import * as Twilio from 'twilio';
import { MessagesService } from './messages.service';
import { ThreadsService } from './threads.service';
import { UsersService } from './users.service';

@Injectable()
export class TwilioService {
    private twilioClient: Twilio.Twilio;

    constructor(@Inject(forwardRef(() => MessagesService)) private messagesService: MessagesService, private configService: ConfigService, private threadsService: ThreadsService, private usersService: UsersService) {
        this.twilioClient = Twilio(
            this.configService.get<string>('TWILIO_ACCOUNT_SID'),
            this.configService.get<string>('TWILIO_AUTH_TOKEN'),
        );
    }

    // Twilio calls this
    async handleWebhook(data: any): Promise<void> {
        Logger.log(data, 'TwilioService.handleWebhook');
        const senderNumber = data.From;

        const ownerContact = await this.usersService.getOwner();

        // We want to see if the sender is already a contact
        const senderContact = await this.usersService.getUserOrCreate(senderNumber);

        const messagePayload = {
            receiverId: ownerContact.id,
            senderId: senderContact.id,
            body: data.Body,
            mediaUrl: '',
        }


        this.messagesService.receiveMessage(messagePayload);

        // Now, handle any autoreply that may occur
        if (senderContact.autoreply) {
            const autoreplyMessagePayload = {
                receiverId: senderContact.id,
                senderId: ownerContact.id,
                body: senderContact.autoreply,
                mediaUrl: '',
            }
            this.usersService.updateUser(senderContact.id, { autoreply: '' }).then(() => {
                this.messagesService.sendMessage(autoreplyMessagePayload).then((message) => {
                    this.sendTwilioMessage(message);
                    this.messagesService.markMessageAsSent(message.id);
                });
            });

        }
    }

    async sendTwilioMessage(message: Message) {
        const receivers = await this.usersService.getUsers({ id: message.receiverId });
        const receiver = receivers[0];

        if (message.mediaUrl) {
            return this.sendFile(receiver.number, message.body, message.mediaUrl);
        }
        else {
            return this.sendText(receiver.number, message.body);
        }
    }

    async sendText(to: string, body: string) {
        return this.twilioClient.messages.create({
            to,
            from: process.env.TWILIO_PHONE_NUMBER,
            body,
        });
    }


    async sendFile(to: string, body: string, filePath: string) {
        return this.twilioClient.messages.create({
            to,
            from: process.env.TWILIO_PHONE_NUMBER,
            body: body,
            mediaUrl: [filePath],
            sendAsMms: true,
        });
    }
}