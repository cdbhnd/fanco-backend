import { IViberBotService } from "./IViberBotService";
import * as Repositories from "../repositories/";
import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Entities from "../entities/";
import * as config from "config";
import { injectable } from "inversify";
// tslint:disable-next-line:no-var-requires
const ViberBot = require("viber-bot").Bot;
// tslint:disable-next-line:no-var-requires
const BotEvents = require("viber-bot").Events;
// tslint:disable-next-line:no-var-requires
const TextMessage = require("viber-bot").Message.Text;

@injectable()
export class ViberBotService implements IViberBotService {

    private botRepository: Repositories.IBotRepository;
    private viberBotObjects = [];

    constructor() {
        this.botRepository = kernel.get<Repositories.IBotRepository>(Types.IBotRepository);
    };

    public async initializeAllBots(): Promise<any> {
        let domainViberBots: Entities.IBot[] = await this.botRepository.find({ service: "Viber" });

        for (let i = 0; i < domainViberBots.length; i++) {
            this.initializeBot(domainViberBots[i]);
        }
    }

    public async initializeBotByName(botName: string): Promise<any> {
        let domainViberBot: Entities.IBot = (await this.botRepository.find({ name: botName })).shift();
        this.initializeBot(domainViberBot);
    }

    public getViberBotObject(botName: string): any {
        let bot = this.viberBotObjects[botName];
        return bot;
    }

    private initializeBot(domainViberBot: Entities.IBot): void {
        const bot = new ViberBot({
            authToken: domainViberBot.token,
            name: domainViberBot.name,
            avatar: domainViberBot.avatar,
        });

        bot.setWebhook(config.get("baseUrl") + "/viber/" + domainViberBot.name);

        this.viberBotObjects[domainViberBot.name] = bot;

        bot.onTextMessage(/^hi|hello$/i, async (message, response) => {
            let res = await this.addSubscriber(bot.name, response.userProfile.id, response.userProfile.name);
            if (res) {
                response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`));
            }else {
                response.send(new TextMessage(`Hey ${response.userProfile.name}. I think we've already met ! :)`));
            }
        });

        bot.onTextMessage(/^bye|Bye$/i, async (message, response) => {
            await this.removeSubscriber(bot.name, response.userProfile.id, response.userProfile.name);
            response.send(new TextMessage(`Farewell ${response.userProfile.name}. I ll be waiting for you to come back`));
        });

    }

    private async addSubscriber(botName: string, subscriberId: string, subscriberName: string): Promise<boolean> {
        let domainViberBot: Entities.IBot = (await this.botRepository.find({ name: botName })).shift();
        if (!this.subscriberExist(domainViberBot, subscriberId)) {
            domainViberBot.subscribers.push({ id: subscriberId, name: subscriberName });
            await this.botRepository.update(domainViberBot);
            return true;
        }
        return false;
    }

    private async removeSubscriber(botName: string, subscriberId: string, subscriberName: string): Promise<boolean> {
        let domainViberBot: Entities.IBot = (await this.botRepository.find({ name: botName })).shift();
        if (!!domainViberBot.subscribers) {
            for (let i = 0; i < domainViberBot.subscribers.length; i++) {
                if (domainViberBot.subscribers[i].id == subscriberId) {
                    domainViberBot.subscribers.splice(i, 1);
                    await this.botRepository.update(domainViberBot);
                    return true;
                }
            }
        }
        return false;
    }

    private subscriberExist(domainViberBot: Entities.IBot, subscriberId: string): boolean {
        if (!!domainViberBot.subscribers) {
            for (let i = 0; i < domainViberBot.subscribers.length; i++) {
                if (domainViberBot.subscribers[i].id == subscriberId) {
                    return true;
                }
            }
        }
        return false;
    }
}
