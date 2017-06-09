import * as Repos from "../repositories";
import * as Entities from "../entities";
import { injectable, inject } from "inversify";
import { BaseRepository } from "./BaseRepository";
import * as Repositories from "../repositories";

@injectable()
export class Events extends BaseRepository<Entities.IEvent> implements Repositories.IEventRepository {

    constructor(@inject("entityName") entityName: string) {
        super(entityName);
    }
}
