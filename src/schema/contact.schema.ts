import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Contact {
  @Prop()
  name: string;

  @Prop()
  number: string;

  @Prop({ required: false, default: '' })
  autoreplyText: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
export type ContactDocument = Contact & Document;
