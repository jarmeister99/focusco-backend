import { Injectable } from "@nestjs/common";
import { Thread } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class ThreadsService {
    constructor(private prismaService: PrismaService) { }

    async getThreads(filterData?: Partial<Thread>, options?: any): Promise<Thread[]> {
        const isOwnerCondition = {
            participants: {
                some: {
                    isOwner: true
                }
            }
        }
        const whereClause = {
            ...filterData,
            ...(options?.ownerOnly ? isOwnerCondition : {})
        }


        return this.prismaService.prismaClient.thread.findMany({
            where: whereClause,
            include: {
                messages: true,
                participants: true
            }
        });
    }



    async getThreadsByParticipants(senderId: number, receiverId: number): Promise<Thread[]> {
        // check if a thread exists between the sender and receiver
        return this.prismaService.prismaClient.thread.findMany({
            where: {
                participants: {
                    some: {
                        OR: [
                            {
                                id: senderId
                            },
                            {
                                id: receiverId
                            }
                        ]
                    }
                }
            }
        });
    }
    async deleteAllThreads() {
        return this.prismaService.prismaClient.thread.deleteMany();
    }
}