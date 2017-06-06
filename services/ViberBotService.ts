import { BaseBotService } from "./BaseBotService";
import * as Repositories from "../repositories/";
import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Services from "./";
import * as Entities from "../entities/";
import * as config from "config";
import * as Exceptions from "../infrastructure/exceptions/";
import { injectable } from "inversify";
// tslint:disable-next-line:no-var-requires
const ViberBot = require("viber-bot").Bot;
// tslint:disable-next-line:no-var-requires
const BotEvents = require("viber-bot").Events;
// tslint:disable-next-line:no-var-requires
const TextMessage = require("viber-bot").Message.Text;
// tslint:disable-next-line:no-var-requires
const PictureMessage = require("viber-bot").Message.Picture;
// tslint:disable-next-line:no-var-requires
let momentTz = require("moment-timezone");

@injectable()
export class ViberBotService extends BaseBotService {

    private viberBotObjects = [];

    protected async createNewBotInstance(data: any, organization: Entities.IOrganization): Promise<Entities.IBot> {
        return await this.getBotRepository().create({
            service: data.service,
            name: !!data.name ? data.name : organization.name,
            avatar: !!data.avatar ? data.avatar : this.getAvatar(),
            token: data.token,
            organizationId: organization.oId,
            subscribers: [],
            shareableLink: !!data.shareableLink ? data.shareableLink : "",
            verificationToken: !!data.verificationToken ? data.verificationToken : "",
            webhook: config.get("baseUrl") + "/viber/" + data.name,
        });
    }

    protected getServiceName(): RegExp {
        return /^viber$/i;
    }

    public getAvatar(): string {
        return String(config.get("viberService.avatarImage")); 
    }

    public getBotObject(botName: string): any {
        return this.viberBotObjects[botName];
    }

    protected getBotObjects(): any[] {
        return this.viberBotObjects;
    }

    protected publishEventToSubscribers(event: Entities.IEvent, bot: Entities.IBot, botObject: any): void {
        for (let j = 0; j < bot.subscribers.length; j++) {
            if (event.type == "image") {
                botObject.sendMessage(bot.subscribers[j], new PictureMessage(event.content));
            } else {
                botObject.sendMessage(bot.subscribers[j], new TextMessage(event.content));
            }
            console.log('Botu poslata poruka');
        }
    }

    protected async initializeBot(domainBot: Entities.IBot) {
        const bot = new ViberBot({
            authToken: domainBot.token,
            name: domainBot.name,
            avatar: domainBot.avatar,
        });

        let botActionsRepo: Repositories.IBotActionsRepository = kernel.get<Repositories.IBotActionsRepository>(Types.IBotActionsRepository);

        let botActions: Entities.IBotActions = await botActionsRepo.findOne({ oId: domainBot.organizationId });

        console.log("Viber bot actions:");
        console.log(botActions);

        if (!botActions) {
            return;
        }

        this.viberBotObjects[domainBot.name] = bot;

        for (let i = 0; i < botActions.actions.length; i++) {
            let botAction: Entities.IAction = botActions.actions[i];
            let action: string = this.actionList[botAction.action];
            if (!action) {
                continue;
            }
            bot.onTextMessage(new RegExp(botAction.keywords, "i"), async (message, response) => {
                console.log("Ahaaaaa " + botAction.keywords + " has been captured");
                let answer: string = await this[action](botAction, domainBot, message, response);
                if (botAction.responseType == "image") {
                    response.send(new PictureMessage(answer));
                } else {
                    response.send(new TextMessage(answer));
                }
            });
            console.log("Event " + botAction.keywords + " added");
        }

        console.log("Viber bot event added");

        domainBot.webhook = config.get("baseUrl") + "/viber/" + domainBot.name;

        bot.setWebhook(domainBot.webhook);

        console.log("Webhook configured");
    }
}
