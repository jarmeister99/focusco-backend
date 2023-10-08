import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageDocument } from 'src/schema/message.schema';
import { ContactsService } from 'src/services/contacts/contacts.service';
import { MessagesService } from 'src/services/messages/messages.service';
import { ThreadsService } from 'src/services/threads/threads.service';
import { TwilioService } from 'src/twilio/twilio.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly contactsService: ContactsService,
    private readonly threadsService: ThreadsService,
    private readonly twilioService: TwilioService,
  ) { }

  @Get()
  async getAllMessages(
    @Body('name') name: string,
    @Body('number') number: string,
  ): Promise<MessageDocument[]> {
    const filterObj = {};
    if (name) {
      filterObj['name'] = name;
    }
    if (number) {
      filterObj['number'] = number;
    }
    return this.messagesService.getAllMessages(filterObj);
  }

  @Post('webhook')
  async receiveWebhook(@Body() data: any): Promise<any> {
    return this.twilioService.handleWebhook(data);
  }

  @Post()
  async createMessage(
    @Body('receiverContactId') receiverContactId: string,
    @Body('threadId') threadId: string,
    @Body('body') messageBody: string,
    @Body('link') link: string,
    @Body('sendVcf') sendVcf: boolean,
  ): Promise<MessageDocument> {
    const receiverContact = await this.contactsService.getContactById(
      receiverContactId,
    );

    const senderContact = await this.contactsService.getOwnerContact();

    const thread = await this.threadsService.getThreadById(threadId);

    const now = new Date();

    const message = {
      receiver: receiverContact,
      sender: senderContact,
      thread: thread._id,
      body: messageBody,
      timestamp: now.getTime(),
      link: link,
      isVcf: sendVcf,
    };

    return this.twilioService
      .sendMessage(message)
      .then(() => {
        return this.messagesService.createMessage(message);
      });
  }
}
