import * as Entities from "../entities";

export interface IEventRepository {
    find(query: any): Promise<Entities.IEvent[]>;
    create(entity: Entities.IEvent): Promise<Entities.IEvent>;
    delete(entity: Entities.IEvent): Promise<boolean>;
}
