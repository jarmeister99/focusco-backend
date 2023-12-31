import { Controller, Delete, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ThreadsService } from "src/servicesv2/threads.service";

@Controller('api/threads')
export class ThreadsController {
    constructor(private threadsService: ThreadsService) { }

    // create an endpoint to get all threads
    @Get()
    async getAllThreads() {
        return this.threadsService.getThreads({});
    }

    // Create an endpoint that gets a thread by ID
    @Get(':id')
    async getThreadById(@Param('id', ParseIntPipe) id: number) {
        return this.threadsService.getThreads({ id });
    }

    @Delete()
    async deleteAllThreads() {
        return this.threadsService.deleteAllThreads();
    }
}