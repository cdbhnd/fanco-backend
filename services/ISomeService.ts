import * as Entities from "../entities/";

export interface ISomeService {
    serviceMethod(argument: any): Promise<any>;
}
