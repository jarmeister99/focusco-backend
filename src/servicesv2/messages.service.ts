import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Message } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { ThreadsService } from "./threads.service";

@Injectable()
export class MessagesService {
    constructor(private prismaService: PrismaService, private threadsService: ThreadsService) { }

    async updateMessage(messageId: number, payload: Partial<Message>) {
        // check if the message exists
        const message = await this.prismaService.prismaClient.message.findMany({
            where: {
                id: messageId
            }
        });
        if (message.length === 0) {
            throw new HttpException('Message or thread does not exist', HttpStatus.BAD_REQUEST);
        }

        // assign the message to the thread
        const result = await this.prismaService.prismaClient.message.update({
            where: {
                id: messageId
            },
            data: payload
        }).catch((error) => {
            throw new HttpException(`Unable to update message - ${error}`, HttpStatus.BAD_REQUEST);
        });
        return result;

    }

    async sendMessage(payload: Message) {
        // ensure that the sender and receiver exist
        const { senderId, receiverId, body, isVcf, mediaUrl } = payload;
        if (!senderId || !receiverId) {
            throw new Error('Sender and receiver must be specified');
        }
        // check if the sender exists
        const sender = await this.prismaService.prismaClient.user.findMany({
            where: {
                id: senderId
            }
        });
        // check if the receiver exists
        const receiver = await this.prismaService.prismaClient.user.findMany({
            where: {
                id: receiverId
            }
        });

        if (sender.length === 0 || receiver.length === 0) {
            throw new HttpException('Sender or receiver does not exist', HttpStatus.BAD_REQUEST);
        }

        // check if a thread exists between the sender and receiver
        // Find an existing thread between the two users
        const thread = await this.prismaService.prismaClient.thread.findFirst({
            where: {
                participants: {
                    every: {
                        id: {
                            in: [senderId, receiverId],
                        },
                    },
                },
            },
        });

        let threadData;

        if (thread) {
            // If thread exists, connect to it
            threadData = { connect: { id: thread.id } };
        } else {
            // If thread does not exist, create a new one
            threadData = {
                create: {
                    participants: {
                        connect: [{ id: senderId }, { id: receiverId }],
                    },
                },
            };
        }

        // create the message
        const message = await this.prismaService.prismaClient.message.create({
            data: {
                body,
                isVcf,
                mediaUrl,
                sender: {
                    connect: {
                        id: senderId
                    }
                },
                receiver: {
                    connect: {
                        id: receiverId
                    }
                },
                thread: threadData
            }
        }).catch((error) => {
            throw new HttpException(`Unable to send message - ${error}`, HttpStatus.BAD_REQUEST);
        });
        return message;
    };

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

    async deleteAllMessages() {
        // delete all messages from the postgres database (use prisma ORM)
        // also include all relations
        return this.prismaService.prismaClient.message.deleteMany();
    }
}
