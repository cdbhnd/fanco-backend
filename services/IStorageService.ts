import { IOrganization } from "../entities/";

export interface IStorageService {

    uploadFile(url: string, organization: IOrganization) : Promise<string>;
}