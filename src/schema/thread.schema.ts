import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Contact } from './contact.schema';
import { Message, MessageSchema } from './message.schema';
import { Document } from 'mongoose';

@Schema()
export class Thread {
  @Prop({ type: Contact })
  contact: Contact;

  @Prop({ type: [{ type: MessageSchema }] })
  messages: Message[];
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
export type ThreadDocument = Thread & Document;
