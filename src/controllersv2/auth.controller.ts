import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "src/servicesv2/auth.service";

@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('passcode')
    addPasscode(@Body() payload: { passcode: string }) {
        this.authService.addPasscode(payload.passcode);
    }

    @Post('check')
    async checkPasscode(@Body() payload: { passcode: string }) {
        return await this.authService.checkPasscode(payload.passcode);
    }
}