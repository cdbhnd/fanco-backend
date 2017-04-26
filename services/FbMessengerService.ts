import { IFbMessengerService } from "./IFbMessengerService";
import * as Repositories from "../repositories/";
import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Entities from "../entities/";
import * as config from "config";
import { injectable } from "inversify";
import { Bot, Elements } from "facebook-messenger-bot";

@injectable()
export class FbMessengerService implements IFbMessengerService {

    private organizationRepository: Repositories.IOrganizationRepository;
    private fbMessengerBots = [];

    constructor() {
        this.organizationRepository = kernel.get<Repositories.IOrganizationRepository>(Types.IOrganizationRepository);
    };

    public async createBot(data: any): Promise<Entities.IBot> {
        let organization: Entities.IOrganization = (await this.organizationRepository.find({ oId: data.organization.toUpperCase() })).shift();
        let bot: Entities.IBot = await this.getBotRepository().create({
            service: data.service,
            name: !!data.name ? data.name : organization.name,
            avatar: "",
            token: data.token,
            organizationId: organization.oId,
            subscribers: [],
            shareableLink: !!data.shareableLink ? data.shareableLink : "",
            verificationToken: !!data.verificationToken ? data.verificationToken : "",
            webhook: config.get("baseUrl") + "/fbmessenger/" + data.name,
        });
        return bot;
    }

    public async initializeAllBots(): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainBots: Entities.IBot[] = await botRepository.find({ service: "FbMessenger" });

        for (let i = 0; i < domainBots.length; i++) {
            try {
                console.log("Initializing bot " + domainBots[i].name);
                this.initializeBot(domainBots[i]);
            } catch (e) {
                console.log(e);
            }
        }
    }

    public async initializeBotByName(domainBot: Entities.IBot): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainViberBot: Entities.IBot = (await botRepository.find({ name: domainBot })).shift();
        console.log("Facebook Messenger bot found " + domainBot);
        this.initializeBot(domainBot);
    }

    public getFbMessengerBotObject(botName: string): any {
        let bot = this.fbMessengerBots[botName];
        return bot;
    }

    private initializeBot(domainBot: Entities.IBot): void {
        const bot = new Bot(domainBot.token, domainBot.verificationToken);

        console.log("Facebook Messenger bot created !");

        this.fbMessengerBots[domainBot.name] = bot;

        console.log("Facebook Messenger bot registered");

        // on message
        bot.on("message", async (message) => {
            console.log(message);
            const { sender } = message;

            await sender.fetch("first_name");

            if (!message.text) {
                return false;
            }

            if (message.text.match(/^hi|hello$/i)) {
                let res = await this.addSubscriber(domainBot.name, sender.id, sender.first_name);
                const out = new Elements();
                if (res) {
                    out.add({ text: `Hi there ${sender.first_name}. I am ${domainBot.name}` });
                    await bot.send(sender.id, out);
                } else {
                    out.add({ text: `Hi ${sender.first_name}. I think we've already met !` });
                    await bot.send(sender.id, out);
                }
                return true;
            }

            if (message.text.match(/^bye|Bye$/i)) {
                await this.removeSubscriber(domainBot.name, sender.id, sender.first_name);
                const out = new Elements();
                out.add({ text: `Farewell ${sender.first_name}. I ll be waiting for you to come back !` });
                await bot.send(sender.id, out);
            }
        });
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
