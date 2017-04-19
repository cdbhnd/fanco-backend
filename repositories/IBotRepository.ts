import * as Entities from "../entities";

export interface IBotRepository {
    find(query: any): Promise<Entities.IBot[]>;
    create(entity: Entities.IBot): Promise<Entities.IBot>;
    delete(entity: Entities.IBot): Promise<boolean>;
    update(entity: Entities.IBot): Promise<Entities.IBot>;
}
