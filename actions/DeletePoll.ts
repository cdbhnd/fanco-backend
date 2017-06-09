import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Exceptions from "../infrastructure/exceptions/";
import * as Repositories from "../repositories/";
import * as Entities from "../entities/";
import { validate } from "../utility/Validator";
import * as Password from "../utility/Password";
import { ActionBase } from "./ActionBase";
import { ActionContext } from "./ActionBase";

export class Action extends ActionBase<Entities.IPoll> {
    private pollRepository: Repositories.IPollRepository;
    private organizationRepository: Repositories.IOrganizationRepository;
    private adminRepository: Repositories.IAdminUserRepository;

    constructor() {
        super();
        this.pollRepository = kernel.get<Repositories.IPollRepository>(Types.IPollRepository);
        this.organizationRepository = kernel.get<Repositories.IOrganizationRepository>(Types.IOrganizationRepository);
        this.adminRepository = kernel.get<Repositories.IAdminUserRepository>(Types.IAdminUserRepository);
    };

    public async execute(context): Promise<Entities.IPoll> {
        let poll: Entities.IPoll = await this.pollRepository.findOne({ pId: context.params.pollId });
        if (!poll) {
            throw new Exceptions.EntityNotFoundException("Poll", context.params.pollId);
        }
        await this.pollRepository.delete(poll);
        return poll;
    }

    protected async onActionExecuting(context: ActionContext): Promise<ActionContext> {
        let organization: Entities.IOrganization = (await this.organizationRepository.find({ oId: context.params.organization.toUpperCase() })).shift();
        if (!organization) {
            throw new Exceptions.EntityNotFoundException("Organization", context.params.organization);
        }
        context.params.organization = organization;
        let adminUser: Entities.IAdminUser = (await this.adminRepository.find({ id: context.params.userId })).shift();
        if (adminUser.organizationId != organization.oId) {
            throw new Exceptions.UserNotAuthorizedException(adminUser.email, "Get all bots");
        }
        return context;
    }

    protected getConstraints() {
        return {
            organization: "required",
            userId: "required",
            pollId: "required"
        };
    }

    protected getSanitizationPattern(): any {
        return {};
    }
}
