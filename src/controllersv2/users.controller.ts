import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { User } from "@prisma/client";
import { UsersService } from "src/servicesv2/users.service";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Delete()
    async deleteAllUsers() {
        try {
            await this.usersService.deleteAllUsers();
        }
        catch (error) {
            throw error;
        }
    }

    @Post()
    async createUser(@Body() payload: User) {
        try {
            await this.usersService.createUser(payload);
        }
        catch (error) {
            throw error;
        }
    }


    @Get()
    async getAllUsers() {
        return this.usersService.getUsers();
    }


    @Get('owner')
    async getOwner() {
        return this.usersService.getOwner();
    }

    // Create an endpoint that gets a user by ID
    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.getUsers({ id });
    }

    @Put()
    async updateUsers(@Body() payload: Partial<User>[]) {
        try {
            for (const user of payload) {
                await this.usersService.updateUser(user.id, user);
            }

        }
        catch (error) {
            throw error;
        }
    }

    // Create an endpoint that allows you to update a user
    @Put(':id')
    async updateUser(@Param('id', ParseIntPipe) id: number, @Body() payload: Partial<User>) {
        try {
            await this.usersService.updateUser(id, payload);
        }
        catch (error) {
            throw error;
        }
    }
}
