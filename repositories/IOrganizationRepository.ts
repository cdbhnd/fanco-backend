import * as Entities from "../entities";

export interface IOrganizationRepository {
    find(query: any): Promise<Entities.IOrganization[]>;
    create(entity: Entities.IOrganization): Promise<Entities.IOrganization>;
    delete(entity: Entities.IOrganization): Promise<Boolean>;
}
