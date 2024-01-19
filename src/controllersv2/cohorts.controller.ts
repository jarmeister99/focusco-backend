import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Response } from "@nestjs/common";
import { Response as ExpressResponse } from 'express';
import { AddUserToCohortDto, CreateCohortDto, RemoveUserFromCohortDto } from "focusco-lib";
import { CohortsService } from "src/servicesv2/cohorts.service";
import { MessagesService } from "src/servicesv2/messages.service";

@Controller('api/cohorts')
export class CohortsController {
    constructor(private cohortsService: CohortsService, private messagesService: MessagesService) { }

    @Get(':id/export')
    async exportCohortMessages(@Response() res: ExpressResponse, @Param('id', ParseIntPipe) id: number) {
        return await this.messagesService.exportMessagesByCohort(res, id);
    }

    @Post()
    async createCohort(@Body() payload: CreateCohortDto) {
        return await this.cohortsService.createCohort(payload);
    }

    @Post('addUser')
    async addUserToCohort(@Body() payload: AddUserToCohortDto) {
        return await this.cohortsService.addUserToCohort(payload);
    }

    @Post('removeUser')
    async removeUserFromCohort(@Body() payload: RemoveUserFromCohortDto) {
        return await this.cohortsService.removeUserFromCohort(payload);
    }

    @Get()
    async getAllCohorts() {
        return await this.cohortsService.getAllCohorts();
    }

    @Delete(':id')
    async deleteCohortById(@Param('id', ParseIntPipe) id: number) {
        return await this.cohortsService.deleteCohort({ id });
    }

}