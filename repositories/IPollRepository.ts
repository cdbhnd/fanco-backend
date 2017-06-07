import { IPoll } from "../entities/IPoll";

export interface IPollRepository {
    find(query: any): Promise<IPoll[]>;
    create(entity: IPoll): Promise<IPoll>;
    delete(entity: IPoll): Promise<boolean>;
    findOne(query: any): Promise<IPoll>;
    update(entity: IPoll): Promise<IPoll>
}