import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import { InvalidCredentialsException } from "../infrastructure/exceptions/";
import * as Repositories from "../repositories/";
import * as Entities from "../entities/";
import { validate } from "../utility/Validator";
import * as Password from "../utility/Password";
import { ActionBase } from "./ActionBase";

export class Action extends ActionBase<Entities.IAdminUser> {
    private adminRepository: Repositories.IAdminUserRepository;

    constructor() {
        super();
        this.adminRepository = kernel.get<Repositories.IAdminUserRepository>(Types.IAdminUserRepository);
    };

    public async execute(context): Promise<Entities.IAdminUser> {
        let adminUser: Entities.IAdminUser = (await this.adminRepository.find({ email: context.params.email })).shift();

        if (typeof (adminUser) == "undefined") {
            throw new InvalidCredentialsException(context.params.email, context.params.password);
        }

        let submitedPasswordValid = await Password.comparePassword(context.params.password, adminUser.password);

        if (submitedPasswordValid) {
            return adminUser;
        } else {
            // throw error
            throw new InvalidCredentialsException(context.params.email, context.params.password);
        }
    }

    protected getConstraints() {
        return {
            email: "required",
            password: "required",
        };
    }

    protected getSanitizationPattern(): any {
        return {};
    }

}
