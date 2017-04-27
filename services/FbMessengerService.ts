import { IBotService } from "./IBotService";
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
export class FbMessengerService implements IBotService {
    private fbMessengerBots = [];

    constructor() {
        // not empty
    };

    public async createBot(data: any): Promise<Entities.IBot> {
        let organization: Entities.IOrganization = (await this.getOrganizationRepository().find({ oId: data.organization.toUpperCase() })).shift();
        let bot: Entities.IBot = await this.getBotRepository().create({
            service: data.service,
            name: !!data.name ? data.name : organization.name,
            avatar: !!data.avatar ? data.avatar : this.getAvatar(),
            token: data.token,
            organizationId: organization.oId,
            subscribers: [],
            shareableLink: !!data.shareableLink ? data.shareableLink : "",
            verificationToken: !!data.verificationToken ? data.verificationToken : "",
            webhook: config.get("baseUrl") + "/fbmessenger/" + data.name,
        });
        await this.initializeBot(bot);
        return bot;
    }

    public async initializeAllBots(): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainBots: Entities.IBot[] = await botRepository.find({ service: "fbmessenger" });

        for (let i = 0; i < domainBots.length; i++) {
            try {
                console.log("Initializing bot " + domainBots[i].name);
                this.initializeBot(domainBots[i]);
            } catch (e) {
                console.log(e);
            }
        }
    }

    public getBotObject(botName: string): any {
        let bot = this.fbMessengerBots[botName];
        return bot;
    }

    public async publishEvent(event: Entities.IEvent): Promise<boolean> {

        try {
            for (let i in this.fbMessengerBots) {
                if (this.fbMessengerBots.hasOwnProperty(i)) {
                    let fbBot: any = this.fbMessengerBots[i];
                    let botRepository = this.getBotRepository();
                    let bot: Entities.IBot = (await botRepository.find({ name: i })).shift();
                    if (bot.organizationId != event.organization) {
                        continue;
                    }
                    for (let j = 0; j < bot.subscribers.length; j++) {
                        const out = new Elements();
                        out.add({ text: event.content });
                        await fbBot.send(bot.subscribers[j].id, out);
                    }
                }
            }
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
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

            if (message.text.match(/^schedule$/i)) {
                let scheduleRepo = this.getScheduleRepository();
                let currentTimestamp = (new Date()).toISOString();
                let schedules: Entities.ISchedule[] = (await scheduleRepo.find({ $query: { timestamp: { $gt: currentTimestamp }, organizationId: domainBot.organizationId }, $orderby: { timestamp: 1 } })).slice(0, 3);
                let scheduleMessage: string = "";

                for (let i = 0; i < schedules.length; i++) {
                    let atTimeMessage = this.generateAtWhatTimeMessage(schedules[i].timestamp);
                    scheduleMessage = scheduleMessage + atTimeMessage + "\n" + schedules[i].description + "\n\n";

                }

                const out = new Elements();
                out.add({ text: scheduleMessage });
                await bot.send(sender.id, out);
            }

            if (message.text.match(/^Results|Rezultati$/i)) {
                let organization = (await this.getOrganizationRepository().find({ oId: domainBot.organizationId })).shift();
                let webPagelink = organization.data.resultsUrl;
                let imageLink = await this.getWebPageToImgService().getPageImgByUrl(webPagelink);

                const out = new Elements();
                out.add({ image: imageLink });
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

    private generateAtWhatTimeMessage(timestamp: string): string {
        let dateObj = momentTz(timestamp).tz("Europe/Belgrade");
        let date = dateObj.format("DD/MM/YYYY");
        let time = dateObj.format("HH:mm");

        let scheduleItemAtTime = date + " at " + time;
        return scheduleItemAtTime;
    }

    private getAvatar(): string {
        return String(config.get("fBMessengerService.avatarImage"));
    }

    private getScheduleRepository(): Repositories.IScheduleRepository {
        return kernel.get<Repositories.IScheduleRepository>(Types.IScheduleRepository);
    }

    private getBotRepository(): Repositories.IBotRepository {
        return kernel.get<Repositories.IBotRepository>(Types.IBotRepository);
    }

    private getOrganizationRepository(): Repositories.IOrganizationRepository {
        return kernel.get<Repositories.IOrganizationRepository>(Types.IOrganizationRepository);
    }

    private getWebPageToImgService(): Services.IWebPageToImgService {
        return kernel.get<Services.IWebPageToImgService>(Types.IWebPageToImgService);
    }
}
