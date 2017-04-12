import * as Entities from "../entities";

export interface IAdminUserRepository {
    find(query: any): Promise<Entities.IAdminUser[]>;
}
