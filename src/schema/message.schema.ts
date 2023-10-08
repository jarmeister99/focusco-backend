import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Contact } from './contact.schema';

@Schema()
export class Message {
  @Prop({ type: Contact })
  sender: Contact;

  @Prop({ type: Contact })
  receiver: Contact;

  @Prop({ type: Types.ObjectId, ref: 'Thread' })
  thread: Types.ObjectId;

  @Prop()
  body: string;

  @Prop()
  timestamp: number;

  @Prop()
  link: string;

  @Prop()
  isVcf: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
export type MessageDocument = Message & Document;
