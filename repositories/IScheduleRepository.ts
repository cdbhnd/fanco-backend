import * as Entities from "../entities";

export interface IScheduleRepository {
    find(query: any): Promise<Entities.ISchedule[]>;
    create(entity: Entities.ISchedule): Promise<Entities.ISchedule>;
    delete(entity: Entities.ISchedule): Promise<boolean>;
    findOne(query: any): Promise<Entities.ISchedule>;
}
