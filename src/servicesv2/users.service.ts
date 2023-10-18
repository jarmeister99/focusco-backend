import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) { }

    async createUser(payload: User) {
        // create a new user in the postgres database (use prisma ORM)
        const result = await this.prismaService.prismaClient.user.create({
            data: payload
        }).catch((error) => {
            throw new Error('Unable to create user');
        });
        return result;
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
