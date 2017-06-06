import { BaseBotService } from "./BaseBotService";
import * as Repositories from "../repositories/";
import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Entities from "../entities/";
import * as config from "config";
import { injectable } from "inversify";
import { Bot, Elements } from "facebook-messenger-bot";
import * as Services from "./";
// tslint:disable-next-line:no-var-requires
let momentTz = require("moment-timezone");

@injectable()
export class FbMessengerService extends BaseBotService {
    private fbMessengerBots = [];

    protected async createNewBotInstance(data: any, organization: Entities.IOrganization): Promise<Entities.IBot> {
        return await this.getBotRepository().create({
            service: data.service,
            name: !!data.name ? data.name : organization.name,
            avatar: !!data.avatar ? data.avatar : this.getAvatar(),
            token: data.token,
            organizationId: organization.oId,
            subscribers: [],
            shareableLink: !!data.shareableLink ? data.shareableLink : "",
            verificationToken: data.name.toUpperCase() + "_" + data.service.toUpperCase(),
            webhook: config.get("baseUrl") + "/fbmessenger/" + data.name,
        });
    }

    protected getServiceName(): RegExp {
        return /^fbmessenger$/i;
    }

    public getAvatar(): string {
        return String(config.get("fBMessengerService.avatarImage"));
    }

    public getBotObject(botName: string): any {
        return this.fbMessengerBots[botName];
    }

    protected getBotObjects(): any[] {
        return this.fbMessengerBots;
    }

    protected publishEventToSubscribers(event: Entities.IEvent, bot: Entities.IBot, botObject: any): void {
        for (let j = 0; j < bot.subscribers.length; j++) {
            const out = new Elements();
            if (event.type == "image") {
                out.add({ image: event.content });
            } else {
                out.add({ text: event.content });
            }
            botObject.send(bot.subscribers[j].id, out);
        }
    }

    protected async initializeBot(domainBot: Entities.IBot) {
        const bot = new Bot(domainBot.token, domainBot.verificationToken);

        console.log("Facebook Messenger bot created !");

        this.fbMessengerBots[domainBot.name] = bot;

        console.log("Facebook Messenger bot registered");

        let botActionsRepo: Repositories.IBotActionsRepository = kernel.get<Repositories.IBotActionsRepository>(Types.IBotActionsRepository);

        let botActions: Entities.IBotActions = await botActionsRepo.findOne({ oId: domainBot.organizationId });

        // on message
        bot.on("message", async (message) => {
            console.log(message);
            const { sender } = message;

            await sender.fetch("first_name");

            if (!message.text) {
                return false;
            }

            for (let i = 0; i < botActions.actions.length; i++) {
                let botAction: Entities.IAction = botActions.actions[i];
                let action: string = this.actionList[botAction.action];
                if (!action) {
                    continue;
                }
                if (message.text.match(new RegExp(botAction.keywords))) {
                    console.log("Facebook messenger: " + botAction.keywords + " has been captured");
                    let answer: string = await this[action](botAction, domainBot, message.text, null);
                    const out = new Elements();
                    if (botAction.responseType == "image") {
                        out.add({ image: answer });
                    } else {
                        out.add({ text: answer });
                    }
                    bot.send(sender.id, out);                    
                }
            }
        });
    }
}
