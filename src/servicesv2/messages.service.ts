import { HttpException, HttpStatus, Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Message, Prisma } from "@prisma/client";
import { createObjectCsvWriter } from "csv-writer";
import { Response as ExpressResponse } from 'express';
import { createReadStream } from "fs";
import { AppGateway } from "src/app.gateway";
import { CreateMessagePayload } from "src/models/api_payloads";
import { PrismaService } from "./prisma.service";
import { ThreadsService } from "./threads.service";
import { TwilioService } from "./twilio.service";
import { UsersService } from "./users.service";


type MessageWithRelations = Prisma.MessageGetPayload<{
    include: {
        sender: true;
        receiver: true;
        thread: true;
    }
}>;

@Injectable()
export class MessagesService {
    constructor(@Inject(forwardRef(() => TwilioService)) private twilioService: TwilioService, private prismaService: PrismaService, private threadsService: ThreadsService, private usersService: UsersService, private appGateway: AppGateway) { }

    async exportMessagesByCohort(res: ExpressResponse, cohortId: number) {
        const messages = await this.getMessagesByCohort(cohortId) as MessageWithRelations[];

        const csvWriter = createObjectCsvWriter({
            path: 'messageExport.csv',
            header: [
                { id: 'senderName', title: 'Sender Name' },
                { id: 'senderNumber', title: 'Sender Number' },
                { id: 'receiverName', title: 'Receiver Name' },
                { id: 'receiverNumber', title: 'Receiver Number' },
                { id: 'body', title: 'Body' },
                { id: 'mediaUrl', title: 'Media URL' },
                { id: 'createdAt', title: 'Updated At' },
            ],
        });

        // sort the messages by created at date
        messages.sort((a, b) => {
            return a.updatedAt.getTime() - b.updatedAt.getTime();
        });
        const formattedMessages = messages.map((message) => {
            return {
                senderName: message.sender.name,
                senderNumber: message.sender.number,
                receiverName: message.receiver.name,
                receiverNumber: message.receiver.number,
                body: message.body,
                mediaUrl: message.mediaUrl,
                createdAt: message.updatedAt
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

    async exportMessages(res: ExpressResponse) {
        const messages = await this.getMessages({ isSent: true }) as MessageWithRelations[];
        const csvWriter = createObjectCsvWriter({
            path: 'messageExport.csv',
            header: [
                { id: 'senderName', title: 'Sender Name' },
                { id: 'senderNumber', title: 'Sender Number' },
                { id: 'receiverName', title: 'Receiver Name' },
                { id: 'receiverNumber', title: 'Receiver Number' },
                { id: 'body', title: 'Body' },
                { id: 'mediaUrl', title: 'Media URL' },
                { id: 'createdAt', title: 'Updated At' },
            ],
        });
        // sort the messages by created at date
        messages.sort((a, b) => {
            return a.updatedAt.getTime() - b.updatedAt.getTime();
        });
        const formattedMessages = messages.map((message) => {
            return {
                senderName: message.sender.name,
                senderNumber: message.sender.number,
                receiverName: message.receiver.name,
                receiverNumber: message.receiver.number,
                body: message.body,
                mediaUrl: message.mediaUrl,
                createdAt: message.updatedAt
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

    async receiveMessage(payload: CreateMessagePayload) {
        const message = await this.createMessage(payload);
        await this.attachMessageToThreadOrCreateNewThread(message.id);
        await this.markMessageAsSent(message.id);
        Logger.log('Received message')
        await this.appGateway.sendEventToClient(message);
    }

    async sendMessage(payload: CreateMessagePayload) {
        const message = await this.createMessage(payload);
        await this.attachMessageToThreadOrCreateNewThread(message.id);
        this.twilioService.sendTwilioMessage(message);
        await this.markMessageAsSent(message.id);
        return message;
    };

    async sendExistingMessage(message: Message) {
        await this.attachMessageToThreadOrCreateNewThread(message.id);
        this.twilioService.sendTwilioMessage(message);
        await this.markMessageAsSent(message.id);
    }

    async markMessageAsSent(messageId: number) {
        await this.prismaService.prismaClient.message.updateMany({
            where: {
                id: messageId
            },
            data: {
                isSent: true
            }
        })
    }

    async attachMessageToThreadOrCreateNewThread(messageId: number) {
        // check if the message exists
        const message = await this.prismaService.prismaClient.message.findFirst({
            where: {
                id: messageId
            }
        });
        if (!message) {
            throw new HttpException('Message does not exist', HttpStatus.BAD_REQUEST);
        }
        const thread = await this.prismaService.prismaClient.thread.findFirst({
            where: {
                participants: {
                    every: {
                        id: {
                            in: [message.senderId, message.receiverId],
                        },
                    },
                },
            },
        });
        if (thread) {
            const result = await this.prismaService.prismaClient.message.update({
                where: {
                    id: messageId
                },
                data: {
                    thread: {
                        connect: {
                            id: thread.id
                        }
                    }
                }
            }).catch((error) => {
                throw new HttpException(`Unable to attach message to thread - ${error}`, HttpStatus.BAD_REQUEST);
            });
            return result;
        }
        else {
            const result = await this.prismaService.prismaClient.message.update({
                where: {
                    id: messageId
                },
                data: {
                    thread: {
                        create: {
                            participants: {
                                connect: [{ id: message.senderId }, { id: message.receiverId }],
                            },
                        },
                    },
                }
            }).catch((error) => {
                throw new HttpException(`Unable to attach message to thread - ${error}`, HttpStatus.BAD_REQUEST);
            });
            return result;
        }
    }

    async getMessages(filterData?: Partial<Message>): Promise<Message[]> {
        // get all messages from the postgres database (use prisma ORM)
        // also include all relations
        return this.prismaService.prismaClient.message.findMany({
            where: filterData,
            include: {
                sender: true,
                receiver: true,
                thread: true
            }
        });
    }

    async getMessagesByCohort(cohortId: number): Promise<Message[]> {
        const cohortUsers = await this.prismaService.prismaClient.cohortUser.findMany({
            where: {
                cohortId
            },
            include: {
                user: {
                    include: {
                        messagesReceived: {
                            include: {
                                sender: true,
                                receiver: true,
                            }
                        },
                        messagesSent: {
                            include: {
                                sender: true,
                                receiver: true,
                            }
                        }
                    }
                }
            }
        });
        return cohortUsers.map((cohortUser) => {
            return [...cohortUser.user.messagesReceived, ...cohortUser.user.messagesSent];
        }).flat();
    }

    async deleteMessage(messageId: number) {
        // delete a message from the postgres database (use prisma ORM)
        return this.prismaService.prismaClient.message.delete({
            where: {
                id: messageId
            }
        });
    }

    async deleteAllMessages() {
        // delete all messages from the postgres database (use prisma ORM)
        // also include all relations
        return this.prismaService.prismaClient.message.deleteMany();
    }

    async deleteAllScheduledMessages() {
        // delete all scheduled messages from the postgres database (use prisma ORM)
        return this.prismaService.prismaClient.message.deleteMany({
            where: {
                isSent: false,
                triggerAt: {
                    not: null
                }
            }
        });
    }

    async scheduleMessages(receiverIds: number[], messagePayload: Partial<CreateMessagePayload>, triggerAt: Date) {
        // get the owner 
        const owner = await this.usersService.getOwner();

        for (const receiverId of receiverIds) {

            const completedMessage: CreateMessagePayload = {
                body: messagePayload.body,
                mediaUrl: messagePayload.mediaUrl,
                receiverId,
                senderId: owner.id
            };

            // create the scheduled message
            await this.createScheduledMessage(completedMessage, triggerAt);
        }

    }

    async getScheduledMessages(): Promise<Message[]> {
        // get all scheduled messages from the postgres database (use prisma ORM)
        // also include all relations
        return this.prismaService.prismaClient.message.findMany({
            where: {
                isSent: false,
            },
            include: {
                sender: true,
                receiver: true,
                thread: true
            }
        });
    };

    async createMessage(messagePayload: CreateMessagePayload): Promise<Message> {
        const newMessage = await this.prismaService.prismaClient.message.create({
            data: {
                body: messagePayload.body,
                mediaUrl: messagePayload.mediaUrl,
                senderId: messagePayload.senderId,
                receiverId: messagePayload.receiverId,
            },
        });

        return newMessage;
    }

    async createScheduledMessage(messagePayload: CreateMessagePayload, triggerAt: Date): Promise<Message> {
        const newScheduledMessage = await this.prismaService.prismaClient.message.create({
            data: {
                scheduledAt: new Date(),
                triggerAt,
                body: messagePayload.body,
                mediaUrl: messagePayload.mediaUrl,
                senderId: messagePayload.senderId,
                receiverId: messagePayload.receiverId,
                isSent: false,
            },
        });

        return newScheduledMessage;
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async checkScheduledMessages() {
        const scheduledMessages = await this.prismaService.prismaClient.message.findMany({
            where: {
                triggerAt: {
                    lte: new Date()
                },
                isSent: false
            },
            include: {
                sender: true,
                receiver: true,
            }
        });
        const promises = scheduledMessages.map(scheduledMessage => this.sendExistingMessage(scheduledMessage));
        if (promises.length > 0) {
            Promise.all(promises).then(() => {
                this.appGateway.sendEventToClient(scheduledMessages);
            });
        }
    }

    async editMessage(messageId: number, messagePayload: Partial<Message>) {
        // edit a message from the postgres database (use prisma ORM)
        return this.prismaService.prismaClient.message.update({
            where: {
                id: messageId
            },
            data: {
                ...messagePayload
            }
        });
    }
}

