import { Injectable } from "@nestjs/common";
import { AppGateway } from "src/app.gateway";
import { AddUserToCohortPayload, CreateCohortPayload, DeleteCohortPayload, UpdateCohortPayload } from "src/models/api_payloads";
import { PrismaService } from "./prisma.service";


@Injectable()
export class CohortsService {

    constructor(private prismaService: PrismaService, private appGateway: AppGateway) { }

    async updateCohort(id: number, payload: UpdateCohortPayload) {
        return this.prismaService.prismaClient.cohort.update({
            where: {
                id: id
            },
            data: {
                ...payload,
                users: {
                    create: payload.users?.map(member => ({ userId: member.id })) || [],
                }
            }
        })
    }

    async deleteCohort(payload: DeleteCohortPayload) {
        const cohortId = payload.id;
        // Start a transaction
        return this.prismaService.prismaClient.$transaction([
            // Delete all associated CohortUser records
            this.prismaService.prismaClient.cohortUser.deleteMany({
                where: {
                    cohortId: cohortId
                }
            }),
            // Delete the Cohort
            this.prismaService.prismaClient.cohort.delete({
                where: {
                    id: cohortId
                }
            })
        ])
    }

    async deleteAllCohorts() {
        // Start a transaction
        return this.prismaService.prismaClient.$transaction([
            // Delete all associated CohortUser records
            this.prismaService.prismaClient.cohortUser.deleteMany({}),
            // Delete the Cohort
            this.prismaService.prismaClient.cohort.deleteMany({})
        ])
    }

    async addUserToCohort(payload: AddUserToCohortPayload) {
        return this.prismaService.prismaClient.cohortUser.create({
            data: {
                userId: payload.userId,
                cohortId: payload.cohortId
            }
        })
    }

    async removeUserFromCohort(payload: AddUserToCohortPayload) {
        return this.prismaService.prismaClient.cohortUser.delete({
            where: {
                userId_cohortId: {
                    userId: payload.userId,
                    cohortId: payload.cohortId
                }
            }
        })
    }

    async createCohort(payload: CreateCohortPayload) {
        try {
            const cohort = await this.prismaService.prismaClient.cohort.create({
                data: {
                    name: payload.name,
                    description: payload.description,
                    users: {
                        create: payload.users?.map(member => ({ userId: member.id })) || [],
                    }
                },
            });

            return cohort;
        } catch (error) {
            console.error("Error creating cohort:", error);
            throw error;
        }
    }

    async getAllCohorts() {
        return this.prismaService.prismaClient.cohort.findMany({
            include: {
                users: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }
}

