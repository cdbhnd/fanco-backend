export interface ISchedule {
    id?: string;
    timestamp: string;
    description: string;
    alarm: boolean;
    organizationId: string;
}
