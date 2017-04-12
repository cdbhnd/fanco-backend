import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ISomeService } from "./ISomeService";
import * as Entities from "../entities/";
import * as Repositories from "../repositories/";
import { Check } from "../utility/Check";
import * as Exceptions from "../infrastructure/exceptions/";
import { injectable } from "inversify";

@injectable()
export class SomeService implements ISomeService {

    constructor() {
        // constructor code goes here
    }

    public async serviceMethod(argument: any): Promise<any> {
        return "";
    }
}
