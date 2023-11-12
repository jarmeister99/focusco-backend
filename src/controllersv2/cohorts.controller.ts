import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Response } from "@nestjs/common";
import { Response as ExpressResponse } from 'express';
import { AddUserToCohortPayload, CreateCohortPayload, DeleteCohortPayload, RemoveUserFromCohortPayload, UpdateCohortPayload } from "src/models/api_payloads";
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
    async createCohort(@Body() payload: CreateCohortPayload) {
        return await this.cohortsService.createCohort(payload);
    }

    @Post('addUser')
    async addUserToCohort(@Body() payload: AddUserToCohortPayload) {
        return await this.cohortsService.addUserToCohort(payload);
    }

    @Post('removeUser')
    async removeUserFromCohort(@Body() payload: RemoveUserFromCohortPayload) {
        return await this.cohortsService.removeUserFromCohort(payload);
    }

    @Post('delete')
    async deleteCohort(@Body() payload: DeleteCohortPayload) {
        return await this.cohortsService.deleteCohort(payload);
    }

    // Create an endpoint that gets a thread by ID
    @Put(':id')
    async updateCohort(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateCohortPayload) {
        return this.cohortsService.updateCohort(id, payload);
    }

    @Get()
    async getAllCohorts() {
        return await this.cohortsService.getAllCohorts();
    }

    @Delete()
    async deleteAllCohorts() {
        return await this.cohortsService.deleteAllCohorts();
    }

    @Delete(':id')
    async deleteCohortById(@Param('id', ParseIntPipe) id: number) {
        return await this.cohortsService.deleteCohort({ id });
    }

}