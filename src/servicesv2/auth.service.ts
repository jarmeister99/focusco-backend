import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";


@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService) { }

    async addPasscode(passcode: string) {
        await this.prismaService.prismaClient.passCode.create({
            data: {
                code: passcode
            }
        })
    }
    async checkPasscode(passcode: string) {
        const passCode = await this.prismaService.prismaClient.passCode.findFirst({
            where: {
                code: passcode
            }
        });
        if (passCode) {
            return true;
        }
        return false;
    }

}

