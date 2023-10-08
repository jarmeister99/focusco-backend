import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from 'src/schema/contact.schema';
import { Message, MessageDocument } from 'src/schema/message.schema';
import { Thread, ThreadDocument } from 'src/schema/thread.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Thread.name) private threadModel: Model<ThreadDocument>,
  ) { }

  async getContactOrCreate(number: string): Promise<ContactDocument> {
    const existingContacts = await this.contactModel.find({ number }).exec();
    if (existingContacts.length > 0) {
      return existingContacts[0];
    } else {
      const newContact = new this.contactModel({
        name: number,
        number,
        autoreplyText: null,
      });
      return newContact.save();
    }
  }

  async updateAutoReplyText(
    contactId: string,
    autoReplyText: string,
  ): Promise<ContactDocument> {
    return this.contactModel
      .findByIdAndUpdate(
        contactId,
        {
          autoreplyText: autoReplyText,
        },
        { new: true },
      )
      .then((contact) => {
        if (!contact) {
          throw new NotFoundException(`Contact with ID ${contactId} not found`);
        }
        return contact;
      });
  }

  async getAllContacts(
    filterObj: Partial<Contact> & Record<string, any>,
  ): Promise<ContactDocument[]> {
    return this.contactModel.find(filterObj).exec();
  }

  async updateContactNameByNumber(number: string, name: string): Promise<ContactDocument> {
    const contacts = await this.getContactsByNumber(number);
    // if there is a contact with that number, then do this. Otherwise, return 500
    if (contacts.length > 0) {
      const contact = contacts[0]
      return this.contactModel
        .findByIdAndUpdate(
          contact._id,
          {
            name: name,
          },
          { new: true },
        )
        .then((newContact) => {
          // update all messages with this contact
          this.messageModel.find({ sender: contact }).then((messages) => {
            messages.forEach((message) => {
              this.messageModel
                .findByIdAndUpdate(
                  message._id,
                  {
                    sender: newContact,
                  },
                  { new: true },
                )
                .then((message) => {
                  if (!message) {
                    throw new NotFoundException(`Message with ID ${message._id} not found`);
                  }
                });
            });
            this.messageModel.find({ receiver: contact }).then((messages) => {
              messages.forEach((message) => {
                this.messageModel
                  .findByIdAndUpdate(
                    message._id,
                    {
                      receiver: newContact,
                    },
                    { new: true },
                  )
                  .then((message) => {
                    if (!message) {
                      throw new NotFoundException(`Message with ID ${message._id} not found`);
                    }
                  });
              });
            });
          });

          // update all threads with this contact
          this.threadModel
            .find({ contact: contact })
            .then((threads) => {
              threads.forEach((thread) => {
                this.threadModel
                  .findByIdAndUpdate(
                    thread._id,
                    {
                      contact: newContact,
                    },
                    { new: true },
                  )
                  .then((thread) => {
                    if (!thread) {
                      throw new NotFoundException(`Thread with ID ${thread._id} not found`);
                    }
                  });
              });
            })

          if (!contact) {
            throw new NotFoundException(`Contact with ID ${contact._id} not found`);
          }
          return newContact;
        });
    } else {
      throw new NotFoundException(`Contact with number ${number} not found`);
    }
  }

  async getContactsByName(name: string): Promise<ContactDocument[]> {
    return this.contactModel.find({ name }).exec();
  }

  async getContactsByNumber(number: string): Promise<ContactDocument[]> {
    return this.contactModel.find({ number }).exec();
  }

  async getContactById(id: string): Promise<ContactDocument> {
    return this.contactModel.findById(id).exec();
  }

  async createContact(contact: Contact): Promise<ContactDocument> {
    const newContact = new this.contactModel(contact);
    return newContact.save();
  }

  async deleteContact(id: string): Promise<ContactDocument> {
    // Find the contact to be deleted
    const deletedContact = await this.contactModel.findByIdAndDelete(id).exec();

    if (!deletedContact) {
      // Handle the case where the contact doesn't exist
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    // Find messages where the contact is either the sender or receiver
    const relatedMessages = await this.messageModel
      .find({
        $or: [{ sender: deletedContact }, { receiver: deletedContact }],
      })
      .exec();

    // Delete the associated messages
    if (relatedMessages.length > 0) {
      await Promise.all(
        relatedMessages.map(async (message) => {
          await this.messageModel.findByIdAndDelete(message._id).exec();
        }),
      );
    }

    // Find threads where contact is the contact
    const relatedThreads = await this.threadModel
      .find({ contact: deletedContact })
      .exec();

    // Delete the associated threads
    if (relatedThreads.length > 0) {
      await Promise.all(
        relatedThreads.map(async (thread) => {
          await this.threadModel.findByIdAndDelete(thread._id).exec();
        }),
      );
    }

    return deletedContact;
  }

  async getOwnerContact(): Promise<ContactDocument> {
    return this.contactModel.findOne({ name: 'Owner' }).exec();
  }
}
