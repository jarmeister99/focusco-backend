import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService {
    readonly prismaClient = new PrismaClient();
    constructor() {
        process.on('beforeExit', () => {
            this.prismaClient.$disconnect();
        });
    }
}