// src/twilio/twilio.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from 'src/schema/message.schema';
import { ContactsService } from 'src/services/contacts/contacts.service';
import { MessagesService } from 'src/services/messages/messages.service';
import { ThreadsService } from 'src/services/threads/threads.service';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio.Twilio;

  constructor(private configService: ConfigService, private messagesService: MessagesService, private threadsService: ThreadsService, private contactsService: ContactsService) {
    this.twilioClient = Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  // Twilio calls this
  async handleWebhook(data: any): Promise<void> {
    const now = new Date();

    const senderNumber = data.From;

    // The receiver is ALWAYS the owner of the Twilio account by definition
    const ownerContact = await this.contactsService.getOwnerContact();

    // We want to see if the sender is already a contact
    const senderContact = await this.contactsService.getContactOrCreate(senderNumber);

    // Similarly, we want to see if there is an existing thread between the sender and the owner
    const thread = await this.threadsService.getThreadOrCreate(senderContact._id);

    // Create the message
    const message = {
      receiver: ownerContact,
      sender: senderContact,
      thread: thread._id,
      body: data.Body,
      isVcf: false,
      link: null,
      timestamp: now.getTime(),
    }
    this.messagesService.createMessage(message).then(() => {
      this.threadsService.addMessageToThread(thread._id, message);
    });

    // Now, handle any autoreply that may occur
    if (senderContact.autoreplyText) {
      const message = {
        receiver: senderContact,
        sender: ownerContact,
        thread: thread._id,
        body: senderContact.autoreplyText,
        isVcf: false,
        link: null,
        timestamp: now.getTime(),
      }
      this.sendText(senderContact.number, senderContact.autoreplyText).then(() => {
        this.messagesService.createMessage(message).then(() => {
          this.contactsService.updateAutoReplyText(senderContact._id, null);
        });
      });
    }
  }

  async sendMessage(message: Message) {
    if (message.link) {
      return this.sendFile(message.receiver.number, message.body, message.link);
    }
    else if (message.isVcf) {
      return this.sendVcf(message.receiver.number, message.body);
    }
    else {
      return this.sendText(message.receiver.number, message.body);
    }
  }

  async sendText(to: string, body: string) {
    return this.twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    });
  }

  async sendVcf(to: string, body: string) {
    return this.twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
      mediaUrl: [this.configService.get<string>('VCF_URL')],
    });
  }

  async sendFile(to: string, body: string, filePath: string) {
    return this.twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: body,
      mediaUrl: [filePath],
    });
  }
}
