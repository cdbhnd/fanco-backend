import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Exceptions from "../infrastructure/exceptions/";
import * as Repositories from "../repositories/";
import * as Entities from "../entities/";
import { validate } from "../utility/Validator";
import * as Password from "../utility/Password";
import { ActionBase } from "./ActionBase";
import { ActionContext } from "./ActionBase";
import * as express from "express";
import * as config from "config";

// tslint:disable-next-line:no-var-requires
const ViberBot = require("viber-bot").Bot;
// tslint:disable-next-line:no-var-requires
const BotEvents = require("viber-bot").Events;
// tslint:disable-next-line:no-var-requires
const TextMessage = require("viber-bot").Message.Text;

export class Action extends ActionBase<boolean> {
    private botRepository: Repositories.IBotRepository;

    constructor() {
        super();
        this.botRepository = kernel.get<Repositories.IBotRepository>(Types.IBotRepository);
    };

    public async execute(context): Promise<boolean> {
        let viberBots: Entities.IBot[] = await this.botRepository.find({ service: "Viber" });
        let expressApp: express.Application = context.params.app;

        for (let i = 0; i < viberBots.length; i++) {

            const bot = new ViberBot({
                authToken: viberBots[i].token, // "45d9b1022530263a-61783d6c83e60359-5a7a31304ea87cf9"
                name: viberBots[i].name, // "CodeBehindEchoBot"
                avatar: viberBots[i].avatar, // "http://codebehind.rs/Content/Images/main_logo_01.png"
            });

            expressApp.use("/viber/" + viberBots[i].name, bot.middleware());
            bot.setWebhook(config.get("baseUrl") + "/viber/" + viberBots[i].name);

            bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
                // Echo's back the message to the client. Your bot logic should sit here.
                response.send(message);
            });

            bot.onTextMessage(/^hi|hello$/i, (message, response) =>
                response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`)));

            bot.onTextMessage(/^paja|Paja$/i, (message, response) =>
                response.send(new TextMessage(`Kakav je to super car`)));

            bot.onTextMessage(/^zolja|Zolja$/i, (message, response) =>
                response.send(new TextMessage(`Ne zna node pa mora magento !`)));

        }

        return true;
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
