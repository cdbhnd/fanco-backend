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

    private viberBotObjects = [];

    constructor() {
        // not empty
    };

    public async initializeAllBots(): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainViberBots: Entities.IBot[] = await botRepository.find({ service: "Viber" });

        for (let i = 0; i < domainViberBots.length; i++) {
            try {
                console.log("Initializing bot " + domainViberBots[i].name);
                this.initializeBot(domainViberBots[i]);
            } catch (e) {
                console.log(e);
            }
        }
    }

    public async initializeBotByName(botName: string): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainViberBot: Entities.IBot = (await botRepository.find({ name: botName })).shift();
        console.log("Viber bot found " + domainViberBot.name);
        this.initializeBot(domainViberBot);
    }

    public getViberBotObject(botName: string): any {
        let bot = this.viberBotObjects[botName];
        return bot;
    }

    public getViberAvatar(): string {
        return String(config.get("viberService.avatarImage"));
    }

    public async publishEvent(event: Entities.IEvent): Promise<boolean> {

        try {
            for (let i in this.viberBotObjects) {
                if (this.viberBotObjects.hasOwnProperty(i)) {
                    let vBot: any = this.viberBotObjects[i];
                    let botRepository = this.getBotRepository();
                    let bot: Entities.IBot = (await botRepository.find({ name: i })).shift();
                    if (bot.organizationId != event.organization) {
                        continue;
                    }
                    for (let j = 0; j < bot.subscribers.length; j++) {
                        vBot.sendMessage(bot.subscribers[j], new TextMessage(event.content));
                    }
                }
            }
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }

    private initializeBot(domainViberBot: Entities.IBot): void {
        const bot = new ViberBot({
            authToken: domainViberBot.token,
            name: domainViberBot.name,
            avatar: domainViberBot.avatar ? domainViberBot.avatar : "http://codebehind.rs/Content/Images/main_logo_01.png",
        });

        console.log("Viber bot created");

        this.viberBotObjects[domainViberBot.name] = bot;

        console.log("Viber bot registered");

        bot.onTextMessage(/^hi|hello$/i, async (message, response) => {
            let res = await this.addSubscriber(bot.name, response.userProfile.id, response.userProfile.name);
            if (res) {
                response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`));
            }else {
                response.send(new TextMessage(`Hey ${response.userProfile.name}. I think we've already met ! :)`));
            }
        });

        bot.onTextMessage(/^schedule$/i, async (message, response) => {
            let scheduleRepo = this.getScheduleRepository();
            let currentTimestamp = (new Date()).toISOString();
            let schedules = (await scheduleRepo.find({ timestamp: { $gt: currentTimestamp } })).slice(0, 3);

            for (let i = 0; i < schedules.length; i++) {
                response.send(new TextMessage(schedules[i].timestamp + " - " + schedules[i].description));
            }
        });

        bot.onTextMessage(/^bye|Bye$/i, async (message, response) => {
            await this.removeSubscriber(bot.name, response.userProfile.id, response.userProfile.name);
            response.send(new TextMessage(`Farewell ${response.userProfile.name}. I ll be waiting for you to come back`));
        });
        console.log("Viber bot event added");

        bot.setWebhook(config.get("baseUrl") + "/viber/" + domainViberBot.name);

        console.log("Webhook configured");
    }

    private async addSubscriber(botName: string, subscriberId: string, subscriberName: string): Promise<boolean> {
        let botRepository = this.getBotRepository();
        let domainViberBot: Entities.IBot = (await botRepository.find({ name: botName })).shift();
        if (!this.subscriberExist(domainViberBot, subscriberId)) {
            domainViberBot.subscribers.push({ id: subscriberId, name: subscriberName });
            await botRepository.update(domainViberBot);
            return true;
        }
        return false;
    }

    private async removeSubscriber(botName: string, subscriberId: string, subscriberName: string): Promise<boolean> {
        let botRepository = this.getBotRepository();
        let domainViberBot: Entities.IBot = (await botRepository.find({ name: botName })).shift();
        if (!!domainViberBot.subscribers) {
            for (let i = 0; i < domainViberBot.subscribers.length; i++) {
                if (domainViberBot.subscribers[i].id == subscriberId) {
                    domainViberBot.subscribers.splice(i, 1);
                    await botRepository.update(domainViberBot);
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

    private getScheduleRepository(): Repositories.IScheduleRepository {
        return kernel.get<Repositories.IScheduleRepository>(Types.IScheduleRepository);
    }

    private getBotRepository(): Repositories.IBotRepository {
        return kernel.get<Repositories.IBotRepository>(Types.IBotRepository);
    }
}
