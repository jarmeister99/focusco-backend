import { Body, Controller, Get, Post } from '@nestjs/common';
import { Contact, ContactDocument } from 'src/schema/contact.schema';
import { ContactsService } from 'src/services/contacts/contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) { }

  @Get()
  async getAllContacts(
    @Body('name') name: string,
    @Body('number') number: string,
  ): Promise<ContactDocument[]> {
    const filterObj = {};
    if (name) {
      filterObj['name'] = name;
    }
    if (number) {
      filterObj['number'] = number;
    }
    return this.contactsService.getAllContacts(filterObj);
  }

  @Post()
  async createContact(@Body() contact: Contact): Promise<ContactDocument> {
    return this.contactsService.createContact(contact);
  }

  @Post('/delete')
  async deleteContact(@Body('_id') id: string): Promise<ContactDocument> {
    return this.contactsService.deleteContact(id);
  }

  @Post('/autoreply')
  async updateAutoReplyText(
    @Body('_id') id: string,
    @Body('autoreplyText') autoreplyText: string,
  ): Promise<ContactDocument> {
    return this.contactsService.updateAutoReplyText(id, autoreplyText);
  }

  @Post('/updateNameByNumber')
  async updateContactName(@Body('number') number: string, @Body('name') name: string): Promise<ContactDocument> {
    return this.contactsService.updateContactNameByNumber(number, name);
  }
}
