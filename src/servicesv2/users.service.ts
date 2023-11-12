import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { CreateUserPayload } from "src/models/api_payloads";
import { PrismaService } from "./prisma.service";


@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) { }

    async deleteUser(userId: number) {
        // Get all the threads associated with the user
        const userThreads = await this.prismaService.prismaClient.thread.findMany({
            where: {
                participants: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        // Delete all threads associated with the user
        for (const thread of userThreads) {
            await this.prismaService.prismaClient.thread.delete({
                where: {
                    id: thread.id
                }
            });
        }

        // Delete the user
        await this.prismaService.prismaClient.user.delete({
            where: {
                id: userId
            }
        });
    }

    async deleteAllUsers() {
        // delete all users from the postgres database (use prisma ORM)

        // Also delete all messages, threads, and contacts

        await this.prismaService.prismaClient.user.deleteMany();

        // create the owner
        await this.prismaService.prismaClient.user.create({
            data: {
                number: process.env.TWILIO_PHONE_NUMBER,
                name: 'FocusCo',
                isOwner: true,
            },
        });

        // also delete all threads (they dont cascade delete due to many to many relationship)
        await this.prismaService.prismaClient.thread.deleteMany();
    }

    async getOwner() {
        // get the owner of the application
        const owner = await this.prismaService.prismaClient.user.findMany({
            where: {
                isOwner: true
            }
        });
        return owner[0];
    }

    async getUserOrCreate(number: string) {
        // check if the user exists
        const users = await this.prismaService.prismaClient.user.findMany({
            where: {
                number: number
            }
        });
        if (users.length > 0) {
            return users[0];
        }
        else {
            const user = await this.prismaService.prismaClient.user.create({
                data: {
                    number: number,
                    name: number,
                }
            });
            return user;
        }
    }

    async createUser(payload: CreateUserPayload) {
        const { name, number, cohort } = payload;

        // Create a new user
        const newUser = await this.prismaService.prismaClient.user.create({
            data: {
                name,
                number,
            },
        });

        // If a cohort is provided, create a relation between the user and the cohort
        if (cohort) {
            await this.prismaService.prismaClient.cohortUser.create({
                data: {
                    userId: newUser.id,
                    cohortId: cohort.id,
                },
            });
        }
        return newUser;
    }

    async getUsers(filterData?: Partial<User>): Promise<User[]> {
        // get all contacts from the postgres database (use prisma ORM)
        // also include all relations
        return this.prismaService.prismaClient.user.findMany({
            where: filterData,
            include: {
                messagesSent: true,
                messagesReceived: true,
                threads: true,
                cohorts: {
                    include: {
                        cohort: true
                    }
                },
            }
        });
    }

    async updateUser(userId: number, payload: Partial<User>) {
        // check if the user exists
        const user = await this.prismaService.prismaClient.user.findMany({
            where: {
                id: userId
            }
        });
        if (user.length === 0) {
            throw new Error('User does not exist');
        }

        // update the user
        const result = await this.prismaService.prismaClient.user.update({
            where: {
                id: userId
            },
            data: payload
        }).catch((error) => {
            throw new Error('Unable to update user');
        });
        return result;
    }
}
