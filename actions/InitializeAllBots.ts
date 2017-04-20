import { Types, kernel } from "../infrastructure/dependency-injection/";
import * as Entities from "../entities/";
import { ActionBase } from "./ActionBase";
import { ActionContext } from "./ActionBase";
import * as Services from "../services/index";

export class Action extends ActionBase<boolean> {
    private viberBotService: Services.IViberBotService;

    constructor() {
        super();
        this.viberBotService = kernel.get<Services.IViberBotService>(Types.IViberBotService);
    };

    public async execute(context): Promise<any> {
        await this.viberBotService.initializeAllBots();
    }

    protected async onActionExecuting(context: ActionContext): Promise<ActionContext> {
        return context;
    }

    protected getConstraints() {
        return {};
    }

    protected getSanitizationPattern(): any {
        return {};
    }

}
