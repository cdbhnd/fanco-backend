import * as Entities from "../entities";

export interface IBotActionsRepository {
    findOne(query: any): Promise<Entities.IBotActions>;
}
