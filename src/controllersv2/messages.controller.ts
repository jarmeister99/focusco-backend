import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { Message } from "@prisma/client";
import { MessagesService } from "src/servicesv2/messages.service";

@Controller('messages')
export class MessagesController {
    constructor(private messagesService: MessagesService) { }

    @Get()
    async getMessages() {
        try {
            return await this.messagesService.getMessages();
        }
        catch (error) {
            throw error;
        }
    }

    // create an endpoint that allows a user to send a message to another user
    @Post()
    async sendMessage(@Body() payload: Message) {
        try {
            await this.messagesService.sendMessage(payload);
        }
        catch (error) {
            throw error;
        }
    }

    @Put(':id')
    async updateMessage(@Param('id', ParseIntPipe) id: number, @Body() payload: Partial<Message>) {
        try {
            await this.messagesService.updateMessage(id, payload);
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