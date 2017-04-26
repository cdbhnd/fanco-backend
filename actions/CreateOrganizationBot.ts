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

export class Action extends ActionBase<Entities.IBot> {
    private botRepository: Repositories.IBotRepository;
    private organizationRepository: Repositories.IOrganizationRepository;
    private adminRepository: Repositories.IAdminUserRepository;
    private viberBotService: Services.IViberBotService;

    constructor() {
        super();
        this.botRepository = kernel.get<Repositories.IBotRepository>(Types.IBotRepository);
        this.organizationRepository = kernel.get<Repositories.IOrganizationRepository>(Types.IOrganizationRepository);
        this.adminRepository = kernel.get<Repositories.IAdminUserRepository>(Types.IAdminUserRepository);
        this.viberBotService = kernel.get<Services.IViberBotService>(Types.IViberBotService);
    };

    public async execute(context): Promise<Entities.IBot> {
        let organization: Entities.IOrganization = (await this.organizationRepository.find({ oId: context.params.organization.toUpperCase() })).shift();

        let bot: Entities.IBot =  await this.botRepository.create({
            service: context.params.service,
            name: !!context.params.name ? context.params.name : organization.name,
            avatar: !!context.params.avatar ? context.params.avatar : this.viberBotService.getViberAvatar(),
            token: context.params.token,
            organizationId: organization.oId,
            subscribers: [],
            webhook: !!context.params.webhook ? context.params.webhook : "",
            shareableLink: !!context.params.shareableLink ? context.params.shareableLink : "",
            verificationToken: !!context.params.verificationToken ? context.params.verificationToken : "",
        });

        try {
            await this.viberBotService.initializeBotByName(bot.name);
        } catch (e) {
            console.log(e);
        }

        return bot;
    }

    protected async onActionExecuting(context: ActionContext): Promise<ActionContext> {
        let organization: Entities.IOrganization = (await this.organizationRepository.find({ oId: context.params.organization.toUpperCase() })).shift();

        if (typeof (organization) == "undefined") {
            throw new Exceptions.EntityNotFoundException("Organization", context.params.organization);
        }

        let adminUser: Entities.IAdminUser = (await this.adminRepository.find({ id: context.params.userId })).shift();

        // if admin is allowed to manage this organization
        if (adminUser.organizationId != organization.oId) {
            throw new Exceptions.UserNotAuthorizedException(adminUser.email, "Create bot");
        }
        return context;
    }

    protected getConstraints() {
        return {
            service: "required",
            token: "required",
            organization: "required",
        };
    }

    protected getSanitizationPattern(): any {
        return {};
    }

}
