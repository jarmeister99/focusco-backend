import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Thread, ThreadDocument } from 'src/schema/thread.schema';
import { ContactsService } from 'src/services/contacts/contacts.service';
import { ThreadsService } from 'src/services/threads/threads.service';

@Controller('threads')
export class ThreadsController {
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly contactsService: ContactsService,
  ) {}

  @Get()
  async getAllThreads(): Promise<ThreadDocument[]> {
    return this.threadsService.getAllThreads();
  }

  @Post()
  async createThread(
    @Body('contactId') contactId: string,
  ): Promise<ThreadDocument> {
    const contact = await this.contactsService.getContactById(contactId);

    if (!contact) {
      throw new Error(`Contact with ID ${contactId} not found`);
    }

    return this.threadsService.createThread({ contact: contact, messages: [] });
  }

  @Post('/delete')
  async deleteThread(@Body('_id') id: string): Promise<ThreadDocument> {
    return this.threadsService.deleteThread(id);
  }
}
