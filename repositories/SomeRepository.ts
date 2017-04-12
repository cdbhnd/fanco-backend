import * as Entities from "../entities";

export interface ISomeRepository {
    repoMethod(argument: any): Promise<any>;
}
