import { Cohort, User } from "@prisma/client";

export interface SendMessagePayload {
    body: string;
    mediaUrl: string;
    receiverId: number;
    senderId: number;
}
export interface ScheduleMessagesPayload {
    receiverIds: number[];
    messagePayload: Omit<SendMessagePayload, 'senderId' | 'receiverId'>;
    triggerAt: Date;
}
// define CreateMessagePayload which is identical to SendMessagePayload
export interface CreateMessagePayload extends SendMessagePayload { }

export interface CreateCohortPayload {
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    users?: User[];
}
export interface UpdateCohortPayload extends CreateCohortPayload {
}

export interface DeleteCohortPayload {
    id: number;
}

export interface AddUserToCohortPayload {
    userId: number;
    cohortId: number;
}
export interface RemoveUserFromCohortPayload extends AddUserToCohortPayload { }

export interface CreateUserPayload {
    name: string;
    number: string;
    cohort?: Cohort;
}