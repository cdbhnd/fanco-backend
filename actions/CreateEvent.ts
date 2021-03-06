import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Exceptions from "../infrastructure/exceptions/";
import * as Repositories from "../repositories/";
import * as Entities from "../entities/";
import { validate } from "../utility/Validator";
import * as Password from "../utility/Password";
import { ActionBase } from "./ActionBase";
import { ActionContext } from "./ActionBase";
import * as Services from "../services/index";
import * as cloudinary from "cloudinary";

export class Action extends ActionBase<Entities.IEvent> {
    private eventRepository: Repositories.IEventRepository;
    private organizationRepository: Repositories.IOrganizationRepository;
    private adminRepository: Repositories.IAdminUserRepository;
    private viberBotService: Services.IBotService;
    private fBmessengerService: Services.IBotService;
    private storageService: Services.IStorageService;

    constructor() {
        super();
        this.eventRepository = kernel.get<Repositories.IEventRepository>(Types.IEventRepository);
        this.organizationRepository = kernel.get<Repositories.IOrganizationRepository>(Types.IOrganizationRepository);
        this.adminRepository = kernel.get<Repositories.IAdminUserRepository>(Types.IAdminUserRepository);
        this.viberBotService =  kernel.getNamed<Services.IBotService>(Types.IBotService, "viber");
        this.fBmessengerService = kernel.getNamed<Services.IBotService>(Types.IBotService, "fbmessenger");
        this.storageService = kernel.get<Services.IStorageService>(Types.IStorageService);
    };

    public async execute(context): Promise<Entities.IEvent> {
        let organization: Entities.IOrganization = context.params.organization;
        let user: Entities.IAdminUser = context.params.user;

        let event: Entities.IEvent = {
            type: context.params.type,
            content: context.params.content,
            timestamp: (new Date()).toISOString(),
            organization: organization.oId,
            postedBy: user.email,
        };

        if (event.type == "image") {
            event.content = await this.storageService.uploadFile(event.content, organization);
        }

        event =  await this.eventRepository.create(event);

        await this.viberBotService.publishEvent(event);
        await this.fBmessengerService.publishEvent(event);

        return event;
    }

    protected async onActionExecuting(context: ActionContext): Promise<ActionContext> {
        let organization: Entities.IOrganization = (await this.organizationRepository.find({ oId: context.params.organization.toUpperCase() })).shift();

        if (!organization) {
            throw new Exceptions.EntityNotFoundException("Organization", context.params.organization);
        }

        context.params.organization = organization;

        let adminUser: Entities.IAdminUser = (await this.adminRepository.find({ id: context.params.userId })).shift();

        // if admin is allowed to manage this organization
        if (adminUser.organizationId != organization.oId) {
            throw new Exceptions.UserNotAuthorizedException(adminUser.email, "Get all bots");
        }

        context.params.user = adminUser;

        return context;
    }

    protected getConstraints() {
        return {
            userId: "required",
            type: "required",
            content: "required",
            organization: "required",
        };
    }

    protected getSanitizationPattern(): any {
        return {};
    }

}
