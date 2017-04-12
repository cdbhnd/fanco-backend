import * as Repos from "../repositories";
import * as Entities from "../entities";
import { injectable, inject } from "inversify";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class SomeDBClass extends BaseRepository<Entities.ISomeEntity> implements Repos.ISomeRepository {

    constructor(@inject("entityName") entityName: string) {
        super(entityName);
    }

    public repoMethod(argument: any): Promise<any> {
        return;
    }
}
