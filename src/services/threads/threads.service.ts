import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from 'src/schema/contact.schema';
import { Message, MessageDocument } from 'src/schema/message.schema';
import { Thread, ThreadDocument } from 'src/schema/thread.schema';
import { ContactsService } from '../contacts/contacts.service';

@Injectable()
export class ThreadsService {
  constructor(
    @InjectModel(Thread.name)
    private readonly threadModel: Model<ThreadDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private contactService: ContactsService,
  ) { }

  async addMessageToThread(threadId: string, message: Message): Promise<ThreadDocument> {
    const thread = await this.threadModel.findById(threadId).exec();
    thread.messages.push(message);
    return thread.save();
  }

  async getThreadOrCreate(senderContactId: string): Promise<ThreadDocument> {
    const existingThread = await this.threadModel.findOne({ 'contact._id': senderContactId }).exec();
    if (existingThread) {
      return existingThread;
    } else {
      const senderContact = await this.contactService.getContactById(senderContactId);
      const newThread = new this.threadModel({
        contact: senderContact,
        messages: [],
      });
      return newThread.save();
    }
  }

  async getAllThreads(): Promise<ThreadDocument[]> {
    return this.threadModel.find().exec();
  }
  async createThread(thread: {
    contact: Contact;
    messages: Message[];
  }): Promise<ThreadDocument> {
    const newThread = new this.threadModel(thread);
    return newThread.save();
  }

  async deleteThread(id: string): Promise<ThreadDocument> {
    const deletedThread = await this.threadModel.findByIdAndDelete(id).exec();

    // get associated messages
    const relatedMessages = await this.messageModel
      .find({ thread: deletedThread._id })
      .exec();

    // delete associated messages
    if (relatedMessages.length > 0) {
      await Promise.all(
        relatedMessages.map(async (message) => {
          await this.messageModel.findByIdAndDelete(message._id).exec();
        }),
      );
    }

    return deletedThread;
  }
  async getThreadById(id: string): Promise<ThreadDocument> {
    return this.threadModel.findById(id).exec();
  }

  async getThreadByContactId(contactId: string): Promise<ThreadDocument | null> {
    const foundThread = await this.threadModel.findOne({ 'contact._id': contactId }).exec();
    return foundThread;
  };
}
