import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from 'src/schema/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) { }

  async getAllMessages(
    filterObj: Partial<Message> & Record<string, any>,
  ): Promise<MessageDocument[]> {
    return this.messageModel.find(filterObj).exec();
  }

  async createMessage(message: Message): Promise<MessageDocument> {
    const newMessage = new this.messageModel(message);
    return newMessage.save();
  }
}
