import { HttpException, Injectable, Logger } from "@nestjs/common";
import { AddUserToCohortAPIResponse, AddUserToCohortDto, CreateCohortAPIResponse, CreateCohortDto, DeleteCohortAPIResponse, DeleteCohortDto, RemoveUserFromCohortAPIResponse, RemoveUserFromCohortDto } from "focusco-lib";
import { AppGateway } from "src/app.gateway";
import { PrismaService } from "./prisma.service";


@Injectable()
export class CohortsService {

    constructor(private prismaService: PrismaService, private appGateway: AppGateway) { }

    async deleteCohort(payload: DeleteCohortDto): Promise<DeleteCohortAPIResponse> {
        try {
            // Start a transaction
            await this.prismaService.prismaClient.$transaction([
                // Delete all associated CohortUser records
                this.prismaService.prismaClient.cohortUser.deleteMany({
                    where: {
                        cohortId: payload.cohortId
                    }
                }),
                // Delete the Cohort
                this.prismaService.prismaClient.cohort.delete({
                    where: {
                        id: payload.cohortId
                    }
                })
            ])
            return { cohortId: payload.cohortId };
        }
        catch (e) {
            Logger.error(e);
            throw new HttpException(e, 500);
        }
    }

    async addUserToCohort(payload: AddUserToCohortDto): Promise<AddUserToCohortAPIResponse> {
        try {
            await this.prismaService.prismaClient.cohortUser.create({
                data: {
                    userId: payload.userId,
                    cohortId: payload.cohortId
                }
            })
            const cohort = await this.prismaService.prismaClient.cohort.findUnique({
                where: { id: payload.cohortId },
                include: { users: true }
            });
            return { cohort };
        }
        catch (e) {
            Logger.error(e);
            throw new HttpException(e, 500);
        }

    }

    async removeUserFromCohort(payload: RemoveUserFromCohortDto): Promise<RemoveUserFromCohortAPIResponse> {
        try {
            await this.prismaService.prismaClient.cohortUser.delete({
                where: {
                    userId_cohortId: {
                        userId: payload.userId,
                        cohortId: payload.cohortId
                    }
                }
            })
            const cohort = await this.prismaService.prismaClient.cohort.findUnique({
                where: { id: payload.cohortId },
                include: { users: true }
            });
            return { cohort };
        }
        catch (e) {
            Logger.error(e);
            throw new HttpException(e, 500);
        }
    }

    async createCohort(payload: CreateCohortDto): Promise<CreateCohortAPIResponse> {
        try {
            const createdCohort = await this.prismaService.prismaClient.$transaction(async (prisma) => {
                // Create the cohort
                const cohort = await prisma.cohort.create({
                    data: {
                        name: payload.name,
                        description: payload.description,
                        isArchived: false, // or whatever default you want
                    },
                });

                const cohortUsers = [];
                // Associate users with the cohort
                for (const userId of payload.userIds) {
                    const cohortUser = await prisma.cohortUser.create({
                        data: {
                            userId,
                            cohortId: cohort.id,
                        }
                    });
                    cohortUsers.push(cohortUser);
                }
                const cohortWithUsers = { ...createdCohort, users: cohortUsers }
                return cohortWithUsers;
            });
            return { cohort: createdCohort };
        } catch (e) {
            Logger.error(e);
            throw new HttpException(e, 500);
        }


    }

    async getAllCohorts() {
        try {
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
        catch (e) {
            Logger.error(e);
            throw new HttpException(e, 500);
        }
    }
}