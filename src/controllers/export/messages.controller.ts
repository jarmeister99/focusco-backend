import { Controller, Get, Response } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';
import { Response as ExpressResponse } from 'express';
import { createReadStream } from 'fs';
import { MessagesService } from 'src/services/messages/messages.service';


@Controller('export/messages')
export class ExportMessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get()
    async getAllContacts(
        @Response() res: ExpressResponse
    ) {
        const messages = await this.messagesService.getAllMessages({});
        const csvWriter = createObjectCsvWriter({
            path: 'messageExport.csv',
            header: [
                { id: 'senderName', title: 'Sender Name' },
                { id: 'senderNumber', title: 'Sender Number' },
                { id: 'receiverName', title: 'Receiver Name' },
                { id: 'receiverNumber', title: 'Receiver Number' },
                { id: 'body', title: 'Body' },
                { id: 'timestamp', title: 'Timestamp' },
                { id: 'link', title: 'Link' },
                { id: 'isVcf', title: 'Is VCF' },
            ],
        });
        const formattedMessages = messages.map(message => {
            return {
                senderName: message.sender.name,
                senderNumber: message.sender.number,
                receiverName: message.receiver.name,
                receiverNumber: message.receiver.number,
                body: message.body,
                timestamp: message.timestamp,
                link: message.link,
                isVcf: message.isVcf,
            }
        })
        csvWriter.writeRecords(formattedMessages).then(() => {
            // Set response headers for file download
            res.set('Content-Type', 'text/csv');
            res.set(
                'Content-Disposition',
                'attachment; filename=messageExport.csv',
            );
            const fileStream = createReadStream('messageExport.csv');
            fileStream.pipe(res);
        });
    }

}
