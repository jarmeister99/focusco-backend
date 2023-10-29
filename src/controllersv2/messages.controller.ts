import { Body, Controller, Delete, Get, Post, Response } from "@nestjs/common";
import { Message } from "@prisma/client";
import { Response as ExpressResponse } from 'express';
import { CreateMessagePayload, MessagesService } from "src/servicesv2/messages.service";
import { TwilioService } from "src/servicesv2/twilio.service";


@Controller('api/messages')
export class MessagesController {
    constructor(private twilioService: TwilioService, private messagesService: MessagesService) { }

    @Get('export')
    async exportMessages(@Response() res: ExpressResponse) {
        try {
            return await this.messagesService.exportMessages(res);
        }
        catch (error) {
            throw error;
        }
    }

    @Delete('schedule')
    async deleteAllScheduledMessages() {
        try {
            await this.messagesService.deleteAllScheduledMessages();
        }
        catch (error) {
            throw error;
        }
    }

    // create an endpoint for messages/schedule
    @Post('schedule')
    async scheduleMessages(@Body() payload: { receiverIds: number[], messagePayload: Message, triggerAt: Date }) {
        try {
            const { receiverIds, messagePayload, triggerAt } = payload;
            await this.messagesService.scheduleMessages(receiverIds, messagePayload, triggerAt);
        }
        catch (error) {
            throw error;
        }
    }
    @Get('schedule')
    async getScheduledMessages() {
        try {
            return await this.messagesService.getScheduledMessages();
        }
        catch (error) {
            throw error;
        }
    }

    @Get()
    async getMessages() {
        try {
            return await this.messagesService.getMessages();
        }
        catch (error) {
            throw error;
        }
    }

    @Post('webhook')
    async receiveWebhook(@Body() data: any): Promise<any> {
        return this.twilioService.handleWebhook(data);
    }

    // create an endpoint that allows a user to send a message to another user
    @Post()
    async sendMessage(@Body() payload: CreateMessagePayload) {
        try {
            await this.messagesService.sendMessage(payload);
        }
        catch (error) {
            throw error;
        }
    }

    @Delete()
    async deleteAllMessages() {
        try {
            await this.messagesService.deleteAllMessages();
        }
        catch (error) {
            throw error;
        }
    }
}