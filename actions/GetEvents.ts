import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Exceptions from "../infrastructure/exceptions/";
import * as Repositories from "../repositories/";
import * as Entities from "../entities/";
import { validate } from "../utility/Validator";
import * as Password from "../utility/Password";
import { ActionBase } from "./ActionBase";
import { ActionContext } from "./ActionBase";

export class Action extends ActionBase<Entities.IEvent[]> {
    private eventRepository: Repositories.IEventRepository;
    private organizationRepository: Repositories.IOrganizationRepository;
    private adminRepository: Repositories.IAdminUserRepository;

    constructor() {
        super();
        this.eventRepository = kernel.get<Repositories.IEventRepository>(Types.IEventRepository);
        this.organizationRepository = kernel.get<Repositories.IOrganizationRepository>(Types.IOrganizationRepository);
        this.adminRepository = kernel.get<Repositories.IAdminUserRepository>(Types.IAdminUserRepository);
    };

    public async execute(context): Promise<Entities.IEvent[]> {
        let organization: Entities.IOrganization = (await this.organizationRepository.find({ oId: context.params.organization.toUpperCase() })).shift();

        let events: Entities.IEvent[] =  await this.eventRepository.find({
            organization: organization.oId,
        });

        return events;
    }

    protected async onActionExecuting(context: ActionContext): Promise<ActionContext> {
        let organization: Entities.IOrganization = (await this.organizationRepository.find({ oId: context.params.organization.toUpperCase() })).shift();

        if (!organization) {
            throw new Exceptions.EntityNotFoundException("Organization", context.params.organization);
        }

        let adminUser: Entities.IAdminUser = (await this.adminRepository.find({ id: context.params.userId })).shift();

        // if admin is allowed to manage this organization
        if (adminUser.organizationId != organization.oId) {
            throw new Exceptions.UserNotAuthorizedException(adminUser.email, "Get all bots");
        }
        return context;
    }

    protected getConstraints() {
        return {
            organization: "required",
        };
    }

    protected getSanitizationPattern(): any {
        return {};
    }

}
